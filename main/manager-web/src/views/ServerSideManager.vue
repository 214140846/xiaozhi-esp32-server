<template>
  <div class="welcome">
    <HeaderBar />

    <div class="operation-bar">
      <h2 class="page-title">服务端管理</h2>
    </div>

    <div class="main-wrapper">
      <div class="content-panel">
        <div class="content-area">
          <el-card class="params-card" shadow="never">
            <el-table ref="paramsTable" :data="paramsList" class="transparent-table" v-loading="loading"
              element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading"
              element-loading-background="rgba(255, 255, 255, 0.7)" :header-cell-class-name="headerCellClassName">
              <el-table-column label="选择" align="center" width="120">
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.selected"></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column label="ws地址" prop="address" align="center"></el-table-column>
              <el-table-column label="操作" prop="operator" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-button size="medium" type="text" @click="emitAction(scope.row, actionMap.restart)">重启</el-button>
                  <el-button size="medium" type="text"
                    @click="emitAction(scope.row, actionMap.update_config)">更新配置</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
    </div>


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
      paramsList: [],
      actionMap: {
        restart: {
          value: 'restart',
          title: "重启服务端",
          message: "确定要重启服务端吗？",
          confirmText: "重启",
        },
        update_config: {
          value: 'update_config',
          title: "更新配置",
          message: "确定要更新配置吗？",
          confirmText: "更新",
        }
      },
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
      Api.admin.getWsServerList(
        {},
        ({ data }) => {
          this.loading = false;
          if (data.code === 0) {
            this.paramsList = data.data.map(item => ({ address: item }));
            this.total = data.data.length;
          } else {
            this.$message.error({
              message: data.msg || '获取参数列表失败',
              showClose: true
            });
          }
        }
      );
    },
    emitAction(rowItem, actionItem) {
      if (actionItem === undefined || rowItem.address === undefined) {
        return;
      }
      // 弹开询问框
      this.$confirm(actionItem.message, actionItem.title, {
        confirmButtonText: actionItem.confirmText, // 确认按钮文本
      }).then(() => {
        // 用户点击了确认按钮
        Api.admin.sendWsServerAction({
          targetWs: rowItem.address,
          action: actionItem.value
        }, ({ data }) => {
          if (data.code !== 0) {
            this.$message.error({
              message: data.msg || '操作失败',
              showClose: true
            });
            return;
          }
          this.$message.success({
            message: `${actionItem.title}成功`,
            showClose: true
          })
        })
      })
    },
    headerCellClassName({ columnIndex }) {
      if (columnIndex === 0) {
        return "custom-selection-header";
      }
      return "";
    }
  },
};
</script>

<style lang="scss" scoped>
// 引入暗黑科技紫主题变量

.welcome {
  min-width: 900px;
  min-height: 506px;
  height: 100vh;
  display: flex;
  position: relative;
  flex-direction: column;
  background: transparent; // 确保Aurora背景可见
  overflow: hidden;
}

.main-wrapper {
  margin: 5px 22px;
  border-radius: 16px;
  min-height: calc(100vh - 24vh);
  height: auto;
  max-height: 80vh;
  position: relative;
  display: flex;
  flex-direction: column;
  // 玻璃拟态效果
  background: rgba(26, 26, 46, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(201, 102, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(201, 102, 255, 0.1);
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  // 玻璃拟态效果
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(201, 102, 255, 0.2);
  border-radius: 16px 16px 0 0;
}

.page-title {
  font-size: 24px;
  margin: 0;
  color: #F8FAFC;
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
  
  :deep(.el-input__inner) {
    background: rgba(26, 26, 46, 0.8) !important;
    border: 1px solid rgba(201, 102, 255, 0.3) !important;
    color: #F8FAFC !important;
    border-radius: 8px;
    
    &:focus {
      border-color: #C966FF !important;
      box-shadow: 0 0 10px rgba(201, 102, 255, 0.3) !important;
    }
  }
  
  :deep(.el-input__inner::placeholder) {
    color: #94A3B8 !important;
  }
}

.btn-search {
  background: linear-gradient(135deg, #C966FF, #D985FF);
  border: 1px solid rgba(201, 102, 255, 0.3);
  border-radius: 8px;
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #D985FF, #E1A4FF);
    box-shadow: 0 0 15px rgba(201, 102, 255, 0.4);
    transform: translateY(-1px);
  }
}

.content-panel {
  flex: 1;
  display: flex;
  overflow: hidden;
  height: 100%;
  border-radius: 0 0 16px 16px;
  background: transparent;
  border: none;
}

.content-area {
  flex: 1;
  height: 100%;
  min-width: 600px;
  overflow: auto;
  background: transparent; // 透明背景确保玻璃效果
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

  :deep(.el-card__body) {
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
    border-radius: 4px;
    line-height: 1;
    font-weight: 500;
    border: none;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
  }

  .el-button--primary {
    background: #5f70f3;
    color: white;
  }

  .el-button--danger {
    background: #fd5b63;
    color: white;
  }
}

:deep(.transparent-table) {
  background: transparent;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  // 玻璃拟态效果
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;

  .el-table__body-wrapper {
    flex: 1;
    overflow-y: auto;
    max-height: none !important;
    background: transparent;
  }

  .el-table__header-wrapper {
    flex-shrink: 0;
    background: rgba(26, 26, 46, 0.9);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .el-table__header th {
    background: rgba(26, 26, 46, 0.9) !important;
    color: #F8FAFC !important;
    font-weight: 600;
    border-bottom: 1px solid rgba(201, 102, 255, 0.3) !important;
    font-size: 14px;
    padding: 16px 0;
  }

  &::before {
    display: none;
  }

  .el-table__body tr {
    background: rgba(26, 26, 46, 0.6) !important;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(201, 102, 255, 0.1) !important;
      box-shadow: 0 0 15px rgba(201, 102, 255, 0.2);
    }

    td {
      border-top: 1px solid rgba(201, 102, 255, 0.1);
      border-bottom: 1px solid rgba(201, 102, 255, 0.1);
      color: #CBD5E1 !important;
      padding: 16px 0;
    }
  }
}


:deep(.el-checkbox__inner) {
  background-color: rgba(26, 26, 46, 0.8) !important;
  border-color: rgba(201, 102, 255, 0.5) !important;
  border-radius: 4px;
}

:deep(.el-checkbox__inner:hover) {
  border-color: #C966FF !important;
  box-shadow: 0 0 8px rgba(201, 102, 255, 0.3);
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #C966FF !important;
  border-color: #C966FF !important;
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
  color: #C966FF !important;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-table .el-button--text:hover) {
  color: #D985FF !important;
  text-shadow: 0 0 8px rgba(201, 102, 255, 0.4);
  transform: translateY(-1px);
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
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    background: #dee7ff;
    color: #606266;
    font-size: 14px;
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
    border-top: 9px solid #606266;
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
  background-color: rgba(15, 15, 35, 0.8) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
}

:deep(.el-loading-spinner .circular) {
  width: 32px;
  height: 32px;
}

:deep(.el-loading-spinner .path) {
  stroke: #C966FF;
  stroke-width: 3;
  filter: drop-shadow(0 0 5px rgba(201, 102, 255, 0.5));
}

:deep(.el-loading-text) {
  color: #F8FAFC !important;
  font-size: 16px;
  margin-top: 12px;
  font-weight: 500;
  text-shadow: 0 0 10px rgba(201, 102, 255, 0.3);
}
</style>
