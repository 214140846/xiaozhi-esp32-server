#!/bin/sh
# 一键部署（ZJ 版本）：使用 ZJ 镜像与命名，自动创建目录并启动 compose
# 仅支持 Debian/Ubuntu x86，其他系统未验证

# 定义中断处理函数
handle_interrupt() {
    echo ""
    echo "安装已被用户中断(Ctrl+C或Esc)"
    echo "如需重新安装，请再次运行脚本"
    exit 1
}

# 设置信号捕获，处理Ctrl+C
trap handle_interrupt SIGINT

# 处理Esc键
# 保存终端设置
old_stty_settings=$(stty -g)
# 设置终端立即响应，不回显
stty -icanon -echo min 1 time 0

# 后台进程检测Esc键
(while true; do
    read -r key
    if [[ $key == $'\e' ]]; then
        # 检测到Esc键，触发中断处理
        kill -SIGINT $$
        break
    fi
done) &

# 脚本结束时恢复终端设置
trap 'stty "$old_stty_settings"' EXIT


# 打印彩色字符画（大字：正 解 科 技）
echo -e "\e[1;32m"  # 设置颜色为亮绿色
cat << "EOF"
████████████    ████████  ██████████   █████████   █████████
      ██        ██    ██      ██       ██           ██    ██
████████████    ████████      ██       █████████    ███████ 
      ██        ██  ██        ██             ██     ██  ██  
      ██        ██  ██        ██             ██     ██  ██  
      ██        ██  ██        ██             ██     ██  ██  
      ██        ██  ██        ██             ██     ██  ██  
████████████    ██  ██        ██       ████████     ██  ██  

                正              解             科           技
EOF
echo -e "\e[0m"  # 重置颜色
echo -e "\e[1;36m  ZJ 服务端部署一键安装脚本 Ver 0.2 2025-08-20 \e[0m\n"
sleep 1



# 检查并安装whiptail
check_whiptail() {
    if ! command -v whiptail &> /dev/null; then
        echo "正在安装whiptail..."
        apt update
        apt install -y whiptail
    fi
}

check_whiptail

# 创建确认对话框
whiptail --title "安装确认" --yesno "即将安装服务端，是否继续？" \
  --yes-button "继续" --no-button "退出" 10 50

# 根据用户选择执行操作
case $? in
  0)
    ;;
  1)
    exit 1
    ;;
esac

# 检查root权限
if [ $EUID -ne 0 ]; then
    whiptail --title "权限错误" --msgbox "请使用root权限运行本脚本" 10 50
    exit 1
fi

# 检查系统版本
if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [ "$ID" != "debian" ] && [ "$ID" != "ubuntu" ]; then
        whiptail --title "系统错误" --msgbox "该脚本只支持Debian/Ubuntu系统执行" 10 60
        exit 1
    fi
else
    whiptail --title "系统错误" --msgbox "无法确定系统版本，该脚本只支持Debian/Ubuntu系统执行" 10 60
    exit 1
fi

# 全局安装目录（宿主机）
INSTALL_BASE="/opt/zj-server"

# 以脚本同目录的 compose 文件为准
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose_all.yml"

# 下载配置文件函数
check_and_download() {
    local filepath=$1
    local url=$2
    if [ ! -f "$filepath" ]; then
        if ! curl -fL --progress-bar "$url" -o "$filepath"; then
            whiptail --title "错误" --msgbox "${filepath}文件下载失败" 10 50
            exit 1
        fi
    else
        echo "${filepath}文件已存在，跳过下载"
    fi
}

# 检查是否已安装
check_installed() {
    # 检查目录是否存在且非空
    if [ -d "$INSTALL_BASE" ] && [ "$(ls -A "$INSTALL_BASE" 2>/dev/null)" ]; then
        DIR_CHECK=1
    else
        DIR_CHECK=0
    fi
    
    # 检查容器是否存在
    if docker inspect zj-server > /dev/null 2>&1; then
        CONTAINER_CHECK=1
    else
        CONTAINER_CHECK=0
    fi
    
    # 两次检查都通过
    if [ $DIR_CHECK -eq 1 ] && [ $CONTAINER_CHECK -eq 1 ]; then
        return 0  # 已安装
    else
        return 1  # 未安装
    fi
}

# 更新相关
if check_installed; then
    if whiptail --title "已安装检测" --yesno "检测到服务端已安装，是否进行升级？" 10 60; then
        echo "开始升级操作..."
        # 轻量升级：仅拉取新镜像并按需重建容器
        docker compose -f "$COMPOSE_FILE" pull --ignore-pull-failures
        docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

        # 备份原有配置文件
        mkdir -p "$INSTALL_BASE/backup/"
        if [ -f "$INSTALL_BASE/data/.config.yaml" ]; then
            cp "$INSTALL_BASE/data/.config.yaml" "$INSTALL_BASE/backup/.config.yaml"
            echo "已备份原有配置文件到 $INSTALL_BASE/backup/.config.yaml"
        fi

        # 同步最新 compose 与配置模板（可选）
        check_and_download "$COMPOSE_FILE" "https://ghfast.top/https://raw.githubusercontent.com/xinnan-tech/xiaozhi-esp32-server/refs/heads/main/main/xiaozhi-server/docker-compose_all.yml"
        check_and_download "$INSTALL_BASE/data/.config.yaml" "https://ghfast.top/https://raw.githubusercontent.com/xinnan-tech/xiaozhi-esp32-server/refs/heads/main/main/xiaozhi-server/config_from_api.yaml"

        echo "升级完成"
        # 升级完成后标记，跳过后续下载步骤
        UPGRADE_COMPLETED=1
    else
        whiptail --title "跳过升级" --msgbox "已取消升级，将继续使用当前版本。" 10 50
        # 跳过升级，继续执行后续安装流程
    fi
fi


# 检查curl安装
if ! command -v curl &> /dev/null; then
    echo "------------------------------------------------------------"
    echo "未检测到curl，正在安装..."
    apt update
    apt install -y curl
else
    echo "------------------------------------------------------------"
    echo "curl已安装，跳过安装步骤"
fi

# 检查Docker安装
if ! command -v docker &> /dev/null; then
    echo "------------------------------------------------------------"
    echo "未检测到Docker，正在安装..."
    
    # 使用国内镜像源替代官方源
    DISTRO=$(lsb_release -cs)
    MIRROR_URL="https://mirrors.aliyun.com/docker-ce/linux/ubuntu"
    GPG_URL="https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg"
    
    # 安装基础依赖
    apt update
    apt install -y apt-transport-https ca-certificates curl software-properties-common gnupg
    
    # 创建密钥目录并添加国内镜像源密钥
    mkdir -p /etc/apt/keyrings
    curl -fsSL "$GPG_URL" | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # 添加国内镜像源
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] $MIRROR_URL $DISTRO stable" \
        > /etc/apt/sources.list.d/docker.list
    
    # 添加备用官方源密钥（避免国内源密钥验证失败）
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 7EA0A9C3F273FCD8 2>/dev/null || \
    echo "警告：部分密钥添加失败，继续尝试安装..."
    
    # 安装Docker
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io
    
    # 启动服务
    systemctl start docker
    systemctl enable docker
    
    # 检查是否安装成功
    if docker --version; then
        echo "------------------------------------------------------------"
        echo "Docker安装完成！"
    else
        whiptail --title "错误" --msgbox "Docker安装失败，请检查日志。" 10 50
        exit 1
    fi
else
    echo "Docker已安装，跳过安装步骤"
fi

# Docker镜像源配置
MIRROR_OPTIONS=(
    "1" "轩辕镜像 (推荐)"
    "2" "腾讯云镜像源"
    "3" "中科大镜像源"
    "4" "网易163镜像源"
    "5" "华为云镜像源"
    "6" "阿里云镜像源"
    "7" "自定义镜像源"
    "8" "跳过配置"
)

MIRROR_CHOICE=$(whiptail --title "选择Docker镜像源" --menu "请选择要使用的Docker镜像源" 20 60 10 \
"${MIRROR_OPTIONS[@]}" 3>&1 1>&2 2>&3) || {
    echo "用户取消选择，退出脚本"
    exit 1
}

case $MIRROR_CHOICE in
    1) MIRROR_URL="https://docker.xuanyuan.me" ;; 
    2) MIRROR_URL="https://mirror.ccs.tencentyun.com" ;; 
    3) MIRROR_URL="https://docker.mirrors.ustc.edu.cn" ;; 
    4) MIRROR_URL="https://hub-mirror.c.163.com" ;; 
    5) MIRROR_URL="https://05f073ad3c0010ea0f4bc00b7105ec20.mirror.swr.myhuaweicloud.com" ;; 
    6) MIRROR_URL="https://registry.aliyuncs.com" ;; 
    7) MIRROR_URL=$(whiptail --title "自定义镜像源" --inputbox "请输入完整的镜像源URL:" 10 60 3>&1 1>&2 2>&3) ;; 
    8) MIRROR_URL="" ;; 
esac

if [ -n "$MIRROR_URL" ]; then
    mkdir -p /etc/docker
    if [ -f /etc/docker/daemon.json ]; then
        cp /etc/docker/daemon.json /etc/docker/daemon.json.bak
    fi
    cat > /etc/docker/daemon.json <<EOF
{
    "dns": ["8.8.8.8", "114.114.114.114"],
    "registry-mirrors": ["$MIRROR_URL"]
}
EOF
    whiptail --title "配置成功" --msgbox "已成功添加镜像源: $MIRROR_URL\n请按Enter键重启Docker服务并继续..." 12 60
    echo "------------------------------------------------------------"
    echo "开始重启Docker服务..."
    systemctl restart docker.service
fi

# 创建安装目录
echo "------------------------------------------------------------"
echo "开始创建安装目录..."
# 检查并创建数据目录
if [ ! -d "$INSTALL_BASE/data" ]; then
    mkdir -p "$INSTALL_BASE/data"
    echo "已创建数据目录: $INSTALL_BASE/data"
else
    echo "目录已存在，跳过创建: $INSTALL_BASE/data"
fi

# 按需使用云端 ASR，跳过本地模型目录和下载

# 如果不是升级完成，才执行下载（仅配置模板，不下载 compose）
if [ -z "$UPGRADE_COMPLETED" ]; then
    check_and_download "$INSTALL_BASE/data/.config.yaml" "https://ghfast.top/https://raw.githubusercontent.com/xinnan-tech/xiaozhi-esp32-server/refs/heads/main/main/xiaozhi-server/config_from_api.yaml"
fi

# 启动Docker服务
(
echo "------------------------------------------------------------"
echo "正在拉取Docker镜像..."
echo "这可能需要几分钟时间，请耐心等待"
# 校验 compose 文件是否存在
if [ ! -f "$COMPOSE_FILE" ]; then
  whiptail --title "错误" --msgbox "未找到同目录的 compose 文件: $COMPOSE_FILE\n请将 docker-compose_all.yml 放在脚本同目录后重试。" 12 70
  exit 1
fi
docker compose -f "$COMPOSE_FILE" up -d

if [ $? -ne 0 ]; then
    whiptail --title "错误" --msgbox "Docker服务启动失败，请尝试更换镜像源后重新执行本脚本" 10 60
    exit 1
fi

echo "------------------------------------------------------------"
echo "正在检查服务启动状态..."

# 通用就绪检查：同时兼容 manager-web(Java) 与 web-react(Nginx) 两种实现
# 优先使用容器 HEALTHCHECK；若无健康检查，再尝试日志与 HTTP 探测
WEB_SVC_NAME="zj-manager-web-react"
TIMEOUT=300
START_TIME=$(date +%s)

# 等待容器存在并处于运行状态
while true; do
    if docker ps --format '{{.Names}}' | grep -q "^${WEB_SVC_NAME}$"; then
        break
    fi
    CURRENT_TIME=$(date +%s)
    if [ $((CURRENT_TIME - START_TIME)) -gt $TIMEOUT ]; then
        whiptail --title "错误" --msgbox "服务启动超时：未发现 ${WEB_SVC_NAME} 容器" 10 60
        exit 1
    fi
    sleep 1
done

# 健康检查循环
while true; do
    CURRENT_TIME=$(date +%s)
    if [ $((CURRENT_TIME - START_TIME)) -gt $TIMEOUT ]; then
        whiptail --title "错误" --msgbox "服务启动超时：健康检查未通过" 10 60
        exit 1
    fi

    # 1) 检查容器 Health 状态（适用于带 HEALTHCHECK 的镜像，如 web-react Nginx）
    HEALTH_STATUS=$(docker inspect -f '{{.State.Health.Status}}' "$WEB_SVC_NAME" 2>/dev/null || echo "")
    if [ "$HEALTH_STATUS" = "healthy" ]; then
        break
    fi

    # 2) 检查 Java 日志（兼容旧版 manager-web：Spring Boot 启动日志）
    if docker logs "$WEB_SVC_NAME" 2>&1 | grep -q "Started AdminApplication in"; then
        break
    fi

    # 3) HTTP 探活：优先 /healthz，其次首页（适用于 Nginx 静态站点）
    if curl -fsS http://127.0.0.1:8002/healthz >/dev/null 2>&1 || \
       curl -fsS http://127.0.0.1:8002/ >/dev/null 2>&1; then
        break
    fi

    sleep 1
done

echo "服务端启动成功！正在完成配置..."
echo "正在启动服务..."
docker compose -f "$COMPOSE_FILE" up -d
echo "服务启动完成！"
)

# 密钥配置

# 获取服务器公网地址
PUBLIC_IP=$(hostname -I | awk '{print $1}')
whiptail --title "配置服务器密钥" --msgbox "请使用浏览器，访问下方链接，打开智控台并注册账号: \n\n内网地址：http://127.0.0.1:8002/\n公网地址：http://$PUBLIC_IP:8002/ (若是云服务器请在服务器安全组放行端口 8000 8001 8002)。\n\n注册的第一个用户即是超级管理员，以后注册的用户都是普通用户。普通用户只能绑定设备和配置智能体; 超级管理员可以进行模型管理、用户管理、参数配置等功能。\n\n注册好后请按Enter键继续" 18 70
SECRET_KEY=$(whiptail --title "配置服务器密钥" --inputbox "请使用超级管理员账号登录智控台\n内网地址：http://127.0.0.1:8002/\n公网地址：http://$PUBLIC_IP:8002/\n在顶部菜单 参数字典 → 参数管理 找到参数编码: server.secret (服务器密钥) \n复制该参数值并输入到下面输入框\n\n请输入密钥(留空则跳过配置):" 15 60 3>&1 1>&2 2>&3)

if [ -n "$SECRET_KEY" ]; then
    python3 -c "
import sys, yaml
config_path = '$INSTALL_BASE/data/.config.yaml'
with open(config_path, 'r') as f:
    config = yaml.safe_load(f) or {}
# 容器内互访走服务名：zj-manager-api:8002
config['manager-api'] = {'url': 'http://zj-manager-api:8002/xiaozhi', 'secret': '$SECRET_KEY'}
with open(config_path, 'w') as f:
    yaml.dump(config, f)
"
    docker restart zj-server
fi

# 获取并显示地址信息
LOCAL_IP=$(hostname -I | awk '{print $1}')

# 修复日志文件获取不到ws的问题，改为硬编码
whiptail --title "安装完成！" --msgbox "\
服务端相关地址如下：\n\
管理后台访问地址: http://$LOCAL_IP:8002\n\
OTA 地址: http://$LOCAL_IP:8002/xiaozhi/ota/\n\
视觉分析接口地址: http://$LOCAL_IP:8003/mcp/vision/explain\n\
WebSocket 地址: ws://$LOCAL_IP:8000/xiaozhi/v1/\n\
\n安装完毕！感谢您的使用！\n按Enter键退出..." 16 70
