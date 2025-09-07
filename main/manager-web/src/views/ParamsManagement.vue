<template>
    <div class="welcome">
        <HeaderBar />

        <div class="operation-bar">
            <h2 class="page-title">参数管理</h2>
            <div class="right-operations">
                <el-input placeholder="请输入参数编码或备注查询" v-model="searchCode" class="search-input"
                    @keyup.enter.native="handleSearch" clearable />
                <el-button class="btn-search" @click="handleSearch">搜索</el-button>
            </div>
        </div>

        <div class="main-wrapper">
            <div class="content-panel">
                <div class="content-area">
                    <el-card class="params-card" shadow="never">
                        <el-table ref="paramsTable" :data="paramsList" class="transparent-table" v-loading="loading"
                            element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading"
                            element-loading-background="rgba(255, 255, 255, 0.7)"
                            :header-cell-class-name="headerCellClassName">
                            <el-table-column label="选择" align="center" width="120">
                                <template slot-scope="scope">
                                    <el-checkbox v-model="scope.row.selected"></el-checkbox>
                                </template>
                            </el-table-column>
                            <el-table-column label="参数编码" prop="paramCode" align="center"></el-table-column>
                            <el-table-column label="参数值" prop="paramValue" align="center" show-overflow-tooltip>
                                <template slot-scope="scope">
                                    <div v-if="isSensitiveParam(scope.row.paramCode)">
                                        <span v-if="!scope.row.showValue">{{ maskSensitiveValue(scope.row.paramValue)
                                        }}</span>
                                        <span v-else>{{ scope.row.paramValue }}</span>
                                        <el-button size="mini" type="text" @click="toggleSensitiveValue(scope.row)">
                                            {{ scope.row.showValue ? '隐藏' : '查看' }}
                                        </el-button>
                                    </div>
                                    <span v-else>{{ scope.row.paramValue }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="备注" prop="remark" align="center"></el-table-column>
                            <el-table-column label="操作" align="center">
                                <template slot-scope="scope">
                                    <el-button size="mini" type="text" @click="editParam(scope.row)">编辑</el-button>
                                    <el-button size="mini" type="text" @click="deleteParam(scope.row)">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <div class="table_bottom">
                            <div class="ctrl_btn">
                                <el-button size="mini" type="primary" class="select-all-btn" @click="handleSelectAll">
                                    {{ isAllSelected ? '取消全选' : '全选' }}
                                </el-button>
                                <el-button size="mini" type="success" @click="showAddDialog">新增</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete"
                                    @click="deleteSelectedParams">删除</el-button>
                            </div>
                            <div class="custom-pagination">
                                <el-select v-model="pageSize" @change="handlePageSizeChange" class="page-size-select">
                                    <el-option v-for="item in pageSizeOptions" :key="item" :label="`${item}条/页`"
                                        :value="item">
                                    </el-option>
                                </el-select>
                                <button class="pagination-btn" :disabled="currentPage === 1" @click="goFirst">
                                    首页
                                </button>
                                <button class="pagination-btn" :disabled="currentPage === 1" @click="goPrev">
                                    上一页
                                </button>
                                <button v-for="page in visiblePages" :key="page" class="pagination-btn"
                                    :class="{ active: page === currentPage }" @click="goToPage(page)">
                                    {{ page }}
                                </button>
                                <button class="pagination-btn" :disabled="currentPage === pageCount" @click="goNext">
                                    下一页
                                </button>
                                <span class="total-text">共{{ total }}条记录</span>
                            </div>
                        </div>
                    </el-card>
                </div>
            </div>
        </div>

        <!-- 新增/编辑参数对话框 -->
        <param-dialog :title="dialogTitle" :visible.sync="dialogVisible" :form="paramForm" @submit="handleSubmit"
            @cancel="dialogVisible = false" />
        <el-footer>
            <version-footer />
        </el-footer>
    </div>
</template>

<script>
import Api from "@/apis/api";
import HeaderBar from "@/components/HeaderBar.vue";
import ParamDialog from "@/components/ParamDialog.vue";
import VersionFooter from "@/components/VersionFooter.vue";
export default {
    components: { HeaderBar, ParamDialog, VersionFooter },
    data() {
        return {
            searchCode: "",
            paramsList: [],
            currentPage: 1,
            loading: false,
            pageSize: 10,
            pageSizeOptions: [10, 20, 50, 100],
            total: 0,
            dialogVisible: false,
            dialogTitle: "新增参数",
            isAllSelected: false,
            sensitive_keys: ["api_key", "personal_access_token", "access_token", "token", "secret", "access_key_secret", "secret_key"],
            paramForm: {
                id: null,
                paramCode: "",
                paramValue: "",
                remark: ""
            },
        };
    },
    created() {
        this.fetchParams();

    },

    computed: {
        pageCount() {
            return Math.ceil(this.total / this.pageSize);
        },
        visiblePages() {
            const pages = [];
            const maxVisible = 3;
            let start = Math.max(1, this.currentPage - 1);
            let end = Math.min(this.pageCount, start + maxVisible - 1);

            if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            return pages;
        },
    },
    methods: {
        handlePageSizeChange(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.fetchParams();
        },
        fetchParams() {
            this.loading = true;
            Api.admin.getParamsList(
                {
                    page: this.currentPage,
                    limit: this.pageSize,
                    paramCode: this.searchCode,
                },
                ({ data }) => {
                    this.loading = false;
                    if (data.code === 0) {
                        this.paramsList = data.data.list.map(item => ({
                            ...item,
                            selected: false,
                            showValue: false
                        }));
                        this.total = data.data.total;
                    } else {
                        this.$message.error({
                            message: data.msg || '获取参数列表失败',
                            showClose: true
                        });
                    }
                }
            );
        },
        handleSearch() {
            this.currentPage = 1;
            this.fetchParams();
        },
        handleSelectAll() {
            this.isAllSelected = !this.isAllSelected;
            this.paramsList.forEach(row => {
                row.selected = this.isAllSelected;
            });
        },
        showAddDialog() {
            this.dialogTitle = "新增参数";
            this.paramForm = {
                id: null,
                paramCode: "",
                paramValue: "",
                remark: ""
            };
            this.dialogVisible = true;
        },
        editParam(row) {
            this.dialogTitle = "编辑参数";
            this.paramForm = { ...row };
            this.dialogVisible = true;
        },

        handleSubmit({ form, done }) {
            if (form.id) {
                // 编辑
                Api.admin.updateParam(form, ({ data }) => {
                    if (data.code === 0) {
                        this.$message.success({
                            message: "修改成功",
                            showClose: true
                        });
                        this.dialogVisible = false;
                        this.fetchParams();
                    }
                    done && done();
                });
            } else {
                // 新增
                Api.admin.addParam(form, ({ data }) => {
                    if (data.code === 0) {
                        this.$message.success({
                            message: "新增成功",
                            showClose: true
                        });
                        this.dialogVisible = false;
                        this.fetchParams();
                    }
                    done && done();
                });
            }
        },

        deleteSelectedParams() {
            const selectedRows = this.paramsList.filter(row => row.selected);
            if (selectedRows.length === 0) {
                this.$message.warning({
                    message: "请先选择需要删除的参数",
                    showClose: true
                });
                return;
            }
            this.deleteParam(selectedRows);
        },
        deleteParam(row) {
            // 处理单个参数或参数数组
            const params = Array.isArray(row) ? row : [row];

            if (Array.isArray(row) && row.length === 0) {
                this.$message.warning({
                    message: "请先选择需要删除的参数",
                    showClose: true
                });
                return;
            }

            const paramCount = params.length;
            this.$confirm(`确定要删除选中的${paramCount}个参数吗？`, '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                distinguishCancelAndClose: true
            }).then(() => {
                const ids = params.map(param => param.id);
                if (ids.some(id => isNaN(id))) {
                    this.$message.error({
                        message: '存在无效的参数ID',
                        showClose: true
                    });
                    return;
                }

                Api.admin.deleteParam(ids, ({ data }) => {
                    if (data.code === 0) {
                        this.$message.success({
                            message: `成功删除${paramCount}个参数`,
                            showClose: true
                        });
                        this.fetchParams();
                    } else {
                        this.$message.error({
                            message: data.msg || '删除失败，请重试',
                            showClose: true
                        });
                    }
                });
            }).catch(action => {
                if (action === 'cancel') {
                    this.$message({
                        type: 'info',
                        message: '已取消删除操作',
                        duration: 1000
                    });
                } else {
                    this.$message({
                        type: 'info',
                        message: '操作已关闭',
                        duration: 1000
                    });
                }
            });
        },
        headerCellClassName({ columnIndex }) {
            if (columnIndex === 0) {
                return "custom-selection-header";
            }
            return "";
        },
        goFirst() {
            this.currentPage = 1;
            this.fetchParams();
        },
        goPrev() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.fetchParams();
            }
        },
        goNext() {
            if (this.currentPage < this.pageCount) {
                this.currentPage++;
                this.fetchParams();
            }
        },
        goToPage(page) {
            this.currentPage = page;
            this.fetchParams();
        },
        isSensitiveParam(paramCode) {
            return this.sensitive_keys.some(key => paramCode.toLowerCase().includes(key.toLowerCase()));
        },
        maskSensitiveValue(value) {
            if (!value) return '';
            if (value.length <= 8) return '****';
            return value.substring(0, 4) + '****' + value.substring(value.length - 4);
        },
        toggleSensitiveValue(row) {
            this.$set(row, 'showValue', !row.showValue);
        },
    },
};
</script>

<style lang="scss" scoped>

.welcome {
    min-width: 900px;
    min-height: 506px;
    height: 100vh;
    display: flex;
    position: relative;
    flex-direction: column;
    background: transparent; // 透明背景显示Aurora
    overflow: hidden;
}

.main-wrapper {
    margin: 5px 22px;
    border-radius: var(--glass-radius);
    min-height: calc(100vh - 24vh);
    height: auto;
    max-height: 80vh;
    position: relative;
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
    display: flex;
    flex-direction: column;
}

.operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: rgba(26, 26, 46, 0.6);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border-radius: var(--glass-radius) var(--glass-radius) 0 0;
    border-bottom: 1px solid var(--glass-border);
}

.page-title {
    font-size: 24px;
    margin: 0;
    color: var(--text-primary);
    font-weight: 600;
    text-shadow: 0 0 10px rgba(201, 102, 255, 0.3);
}

.right-operations {
    display: flex;
    gap: 10px;
    margin-left: auto;
}

.search-input {
    width: 240px;
}

.btn-search {
    background: linear-gradient(135deg, var(--primary-purple), #B347E8);
    border: 1px solid var(--glass-border);
    color: white;
    transition: all 0.3s ease;
    box-shadow: 0 0 15px rgba(201, 102, 255, 0.3);
    
    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 0 20px rgba(201, 102, 255, 0.5);
        background: linear-gradient(135deg, #D985FF, var(--primary-purple));
    }
}

.content-panel {
    flex: 1;
    display: flex;
    overflow: hidden;
    height: 100%;
    border-radius: 0 0 var(--glass-radius) var(--glass-radius);
    background: transparent;
    border: none;
}

.content-area {
    flex: 1;
    height: 100%;
    min-width: 600px;
    overflow: auto;
    background: rgba(26, 26, 46, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
}

.params-card {
    background: transparent;
    flex: 1;
    display: flex;
    flex-direction: column;
    border: none;
    box-shadow: none;
    overflow: hidden;

    ::v-deep .el-card__body {
        padding: 15px;
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
        background: transparent;
    }
}

.table_bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    padding-bottom: 10px;
}

.ctrl_btn {
    display: flex;
    gap: 8px;
    padding-left: 26px;

    .el-button {
        min-width: 72px;
        height: 32px;
        padding: 7px 12px 7px 10px;
        font-size: 12px;
        border-radius: 8px;
        line-height: 1;
        font-weight: 500;
        border: 1px solid var(--glass-border);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        box-shadow: 0 0 10px rgba(201, 102, 255, 0.2);

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 0 15px rgba(201, 102, 255, 0.4);
        }
    }

    .el-button--primary {
        background: linear-gradient(135deg, var(--primary-purple), #B347E8);
        color: white;
        border-color: var(--primary-purple);
    }

    .el-button--danger {
        background: linear-gradient(135deg, #EF4444, #DC2626);
        color: white;
        border-color: #EF4444;
    }
}

.custom-pagination {
    display: flex;
    align-items: center;
    gap: 10px;

    .el-select {
        margin-right: 8px;
    }

    .pagination-btn:first-child,
    .pagination-btn:nth-child(2),
    .pagination-btn:nth-last-child(2),
    .pagination-btn:nth-child(3) {
        min-width: 60px;
        height: 32px;
        padding: 0 12px;
        border-radius: 8px;
        border: 1px solid var(--glass-border);
        background: rgba(26, 26, 46, 0.6);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: var(--text-secondary);
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
            background: rgba(201, 102, 255, 0.2);
            border-color: var(--primary-purple);
            color: var(--text-primary);
        }

        &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            background: rgba(26, 26, 46, 0.3);
        }
    }

    .pagination-btn:not(:first-child):not(:nth-child(3)):not(:nth-child(2)):not(:nth-last-child(2)) {
        min-width: 28px;
        height: 32px;
        padding: 0;
        border-radius: 8px;
        border: 1px solid transparent;
        background: rgba(26, 26, 46, 0.4);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: var(--text-secondary);
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
            background: rgba(201, 102, 255, 0.2);
            border-color: var(--glass-border);
            color: var(--text-primary);
        }
    }

    .pagination-btn.active {
        background: linear-gradient(135deg, var(--primary-purple), #B347E8) !important;
        color: #ffffff !important;
        border-color: var(--primary-purple) !important;
        box-shadow: 0 0 15px rgba(201, 102, 255, 0.4) !important;

        &:hover {
            background: linear-gradient(135deg, #D985FF, var(--primary-purple)) !important;
            box-shadow: 0 0 20px rgba(201, 102, 255, 0.6) !important;
        }
    }

    .total-text {
        color: #909399;
        font-size: 14px;
        margin-left: 10px;
    }
}

:deep(.transparent-table) {
    background: transparent;
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;

    .el-table__body-wrapper {
        flex: 1;
        overflow-y: auto;
        max-height: none !important;
        background: rgba(26, 26, 46, 0.2);
        backdrop-filter: blur(5px);
        border-radius: 8px;
    }

    .el-table__header-wrapper {
        flex-shrink: 0;
        background: rgba(26, 26, 46, 0.5);
        backdrop-filter: blur(10px);
        border-radius: 8px 8px 0 0;
        border-bottom: 1px solid var(--glass-border);
    }

    .el-table__header th {
        background: transparent !important;
        color: var(--text-secondary) !important;
        border-bottom: 1px solid var(--glass-border) !important;
        font-weight: 600;
        text-shadow: 0 0 6px rgba(201, 102, 255, 0.2);
    }

    &::before {
        display: none;
    }

    .el-table__body tr {
        background-color: transparent;
        transition: all 0.3s ease;

        &:hover {
            background-color: rgba(201, 102, 255, 0.1) !important;
        }

        td {
            border-top: 1px solid rgba(201, 102, 255, 0.1);
            border-bottom: 1px solid rgba(201, 102, 255, 0.1);
            color: var(--text-secondary);
        }
    }
}

/* 表头选择列专属样式 */
:deep(.custom-selection-header) {
    color: var(--text-secondary) !important;
}


:deep(.el-checkbox__inner) {
    background-color: rgba(26, 26, 46, 0.6) !important;
    border-color: var(--glass-border) !important;
    backdrop-filter: blur(5px);
}

:deep(.el-checkbox__inner:hover) {
    border-color: var(--primary-purple) !important;
    box-shadow: 0 0 8px rgba(201, 102, 255, 0.3);
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: var(--primary-purple) !important;
    border-color: var(--primary-purple) !important;
    box-shadow: 0 0 10px rgba(201, 102, 255, 0.4);
}

@media (min-width: 1144px) {
    .table_bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 40px;
    }

    :deep(.transparent-table) {
        .el-table__body tr {
            td {
                padding-top: 16px;
                padding-bottom: 16px;
            }

            &+tr {
                margin-top: 10px;
            }
        }
    }
}

:deep(.el-table .el-button--text) {
    color: #7079aa;
}

:deep(.el-table .el-button--text:hover) {
    color: #5a64b5;
}

.el-button--success {
    background: #5bc98c;
    color: white;
}

:deep(.el-table .cell) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.page-size-select {
    width: 100px;
    margin-right: 10px;

    :deep(.el-input__inner) {
        height: 32px;
        line-height: 32px;
        border-radius: 8px;
        border: 1px solid var(--glass-border);
        background: rgba(26, 26, 46, 0.6);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: var(--text-secondary);
        font-size: 14px;
        transition: all 0.3s ease;

        &:hover, &:focus {
            border-color: var(--primary-purple);
            box-shadow: 0 0 10px rgba(201, 102, 255, 0.3);
            color: var(--text-primary);
        }
    }

    :deep(.el-input__suffix) {
        right: 6px;
        width: 15px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 6px;
        border-radius: 4px;
    }

    :deep(.el-input__suffix-inner) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    :deep(.el-icon-arrow-up:before) {
        content: "";
        display: inline-block;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 9px solid var(--text-secondary);
        position: relative;
        transform: rotate(0deg);
        transition: transform 0.3s;
    }
}

:deep(.el-table) {
    .el-table__body-wrapper {
        transition: height 0.3s ease;
    }
}

.el-table {
    --table-max-height: calc(100vh - 40vh);
    max-height: var(--table-max-height);

    .el-table__body-wrapper {
        max-height: calc(var(--table-max-height) - 40px);
    }
}

:deep(.el-loading-mask) {
    background-color: rgba(255, 255, 255, 0.6) !important;
    backdrop-filter: blur(2px);
}

:deep(.el-loading-spinner .circular) {
    width: 28px;
    height: 28px;
}

:deep(.el-loading-spinner .path) {
    stroke: #6b8cff;
}

:deep(.el-loading-text) {
    color: #6b8cff !important;
    font-size: 14px;
    margin-top: 8px;
}

// 搜索输入框样式
:deep(.search-input .el-input__inner) {
    background: rgba(26, 26, 46, 0.6);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    color: var(--text-secondary);
    transition: all 0.3s ease;

    &:hover, &:focus {
        border-color: var(--primary-purple);
        box-shadow: 0 0 10px rgba(201, 102, 255, 0.3);
        color: var(--text-primary);
    }

    &::placeholder {
        color: var(--text-placeholder);
    }
}

// 表格文本按钮样式
:deep(.el-table .el-button--text) {
    color: var(--primary-purple) !important;
    transition: all 0.3s ease;

    &:hover {
        color: #D985FF !important;
        text-shadow: 0 0 8px rgba(201, 102, 255, 0.4);
    }
}

// 总记录数文本颜色
.total-text {
    color: var(--text-tertiary);
}

// 成功按钮颜色
.el-button--success {
    background: linear-gradient(135deg, #10B981, #059669);
    border-color: #10B981;
    color: white;
}
</style>
