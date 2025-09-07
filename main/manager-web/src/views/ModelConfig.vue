<template>
  <div class="welcome">
    <HeaderBar />

    <div class="operation-bar">
      <h2 class="page-title">{{ modelTypeText }}</h2>
      <div class="action-group">
        <div class="search-group">
          <el-input placeholder="请输入模型名称查询" v-model="search" class="search-input" clearable
            @keyup.enter.native="handleSearch" style="width: 240px" />
          <el-button class="btn-search" @click="handleSearch">
            搜索
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-wrapper">
      <div class="content-panel">
        <!-- 左侧导航 -->
        <el-menu :default-active="activeTab" class="nav-panel" @select="handleMenuSelect"
          style="background-size: cover; background-position: center;">
          <el-menu-item index="vad">
            <span class="menu-text">语言活动检测</span>
          </el-menu-item>
          <el-menu-item index="asr">
            <span class="menu-text">语音识别</span>
          </el-menu-item>
          <el-menu-item index="llm">
            <span class="menu-text">大语言模型</span>
          </el-menu-item>
          <el-menu-item index="vllm">
            <span class="menu-text">视觉大模型</span>
          </el-menu-item>
          <el-menu-item index="intent">
            <span class="menu-text">意图识别</span>
          </el-menu-item>
          <el-menu-item index="tts">
            <span class="menu-text">语音合成</span>
          </el-menu-item>
          <el-menu-item index="memory">
            <span class="menu-text">记忆</span>
          </el-menu-item>
        </el-menu>

        <!-- 右侧内容 -->
        <div class="content-area">
          <el-card class="model-card" shadow="never">
            <el-table ref="modelTable" style="width: 100%" v-loading="loading" element-loading-text="拼命加载中"
              element-loading-spinner="el-icon-loading" element-loading-background="rgba(255, 255, 255, 0.7)"
              :header-cell-style="{ background: 'transparent' }" :data="modelList" class="data-table"
              header-row-class-name="table-header" :header-cell-class-name="headerCellClassName"
              @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55" align="center"></el-table-column>
              <el-table-column label="模型ID" prop="id" align="center"></el-table-column>
              <el-table-column label="模型名称" prop="modelName" align="center"></el-table-column>
              <el-table-column label="提供商" align="center">
                <template slot-scope="scope">
                  {{ scope.row.configJson.type || '未知' }}
                </template>
              </el-table-column>
              <el-table-column label="是否启用" align="center">
                <template slot-scope="scope">
                  <el-switch v-model="scope.row.isEnabled" class="custom-switch" :active-value="1" :inactive-value="0"
                    @change="handleStatusChange(scope.row)" />
                </template>
              </el-table-column>
              <el-table-column label="是否默认" align="center">
                <template slot-scope="scope">
                  <el-switch v-model="scope.row.isDefault" class="custom-switch" :active-value="1" :inactive-value="0"
                    @change="handleDefaultChange(scope.row)" />
                </template>
              </el-table-column>
              <el-table-column v-if="activeTab === 'tts'" label="音色管理" align="center">
                <template slot-scope="scope">
                  <el-button type="text" size="mini" @click="openTtsDialog(scope.row)" class="voice-management-btn">
                    音色管理
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="180px">
                <template slot-scope="scope">
                  <el-button type="text" size="mini" @click="editModel(scope.row)" class="edit-btn">
                    修改
                  </el-button>
                  <el-button type="text" size="mini" @click="duplicateModel(scope.row)" class="edit-btn">
                    创建副本
                  </el-button>
                  <el-button type="text" size="mini" @click="deleteModel(scope.row)" class="delete-btn">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="table-footer">
              <div class="batch-actions">
                <el-button size="mini" type="primary" @click="selectAll">
                  {{ isAllSelected ?
                    '取消全选' : '全选' }}
                </el-button>
                <el-button type="success" size="mini" @click="addModel" class="add-btn">
                  新增
                </el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="batchDelete">
                  删除
                </el-button>
              </div>
              <div class="custom-pagination">

                <el-select v-model="pageSize" @change="handlePageSizeChange" class="page-size-select">
                  <el-option v-for="item in pageSizeOptions" :key="item" :label="`${item}条/页`" :value="item">
                  </el-option>
                </el-select>

                <button class="pagination-btn" :disabled="currentPage === 1" @click="goFirst">首页</button>
                <button class="pagination-btn" :disabled="currentPage === 1" @click="goPrev">上一页</button>

                <button v-for="page in visiblePages" :key="page" class="pagination-btn"
                  :class="{ active: page === currentPage }" @click="goToPage(page)">
                  {{ page }}
                </button>

                <button class="pagination-btn" :disabled="currentPage === pageCount" @click="goNext">下一页</button>
                <span class="total-text">共{{ total }}条记录</span>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <ModelEditDialog :modelType="activeTab" :visible.sync="editDialogVisible" :modelData="editModelData"
        @save="handleModelSave" />
      <TtsModel :visible.sync="ttsDialogVisible" :ttsModelId="selectedTtsModelId" :modelConfig="selectedModelConfig" />
      <AddModelDialog :modelType="activeTab" :visible.sync="addDialogVisible" @confirm="handleAddConfirm" />
    </div>
    <el-footer>
      <version-footer />
    </el-footer>
  </div>
</template>

<script>
import Api from "@/apis/api";
import AddModelDialog from "@/components/AddModelDialog.vue";
import HeaderBar from "@/components/HeaderBar.vue";
import ModelEditDialog from "@/components/ModelEditDialog.vue";
import TtsModel from "@/components/TtsModel.vue";
import VersionFooter from "@/components/VersionFooter.vue";
export default {
  components: { HeaderBar, ModelEditDialog, TtsModel, AddModelDialog, VersionFooter },
  data() {
    return {
      addDialogVisible: false,
      activeTab: 'llm',
      search: '',
      editDialogVisible: false,
      editModelData: {},
      ttsDialogVisible: false,
      selectedTtsModelId: '',
      modelList: [],
      pageSizeOptions: [10, 20, 50, 100],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      selectedModels: [],
      isAllSelected: false,
      loading: false,
      selectedModelConfig: {}
    };
  },

  created() {
    this.loadData();
  },

  computed: {
    modelTypeText() {
      const map = {
        vad: '语言活动检测模型(VAD)',
        asr: '语音识别模型(ASR)',
        llm: '大语言模型（LLM）',
        vllm: '视觉大模型（VLLM）',
        intent: '意图识别模型(Intent)',
        tts: '语音合成模型(TTS)',
        memory: '记忆模型(Memory)'
      }
      return map[this.activeTab] || '模型配置'
    },
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
    }
  },

  methods: {
    handlePageSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.loadData();
    },
    openTtsDialog(row) {
      this.selectedTtsModelId = row.id;
      this.selectedModelConfig = row;
      this.ttsDialogVisible = true;
    },
    headerCellClassName({ column, columnIndex }) {
      if (columnIndex === 0) {
        return 'custom-selection-header';
      }
      return '';
    },
    handleMenuSelect(index) {
      this.activeTab = index;
      this.currentPage = 1;  // 重置到第一页
      this.pageSize = 10;     // 可选：重置每页条数
      this.loadData();
    },
    handleSearch() {
      this.currentPage = 1;
      this.loadData();
    },
    // 批量删除
    batchDelete() {
      if (this.selectedModels.length === 0) {
        this.$message.warning('请先选择要删除的模型')
        return
      }

      this.$confirm('确定要删除选中的模型吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const deletePromises = this.selectedModels.map(model =>
          new Promise(resolve => {
            Api.model.deleteModel(
              model.id,
              ({ data }) => resolve(data.code === 0)
            )
          })
        )

        Promise.all(deletePromises).then(results => {
          if (results.every(Boolean)) {
            this.$message.success({
              message: '批量删除成功',
              showClose: true
            })
            this.loadData()
          } else {
            this.$message.error({
              message: '部分删除失败',
              showClose: true
            })
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    addModel() {
      this.addDialogVisible = true;
    },
    editModel(model) {
      this.editModelData = JSON.parse(JSON.stringify(model));
      this.editDialogVisible = true;
    },
    duplicateModel(model) {
      this.editModelData = JSON.parse(JSON.stringify(model));
      this.editModelData.duplicateMode = true;
      this.editDialogVisible = true;
    },
    // 删除单个模型
    deleteModel(model) {
      this.$confirm('确定要删除该模型吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        Api.model.deleteModel(
          model.id,
          ({ data }) => {
            if (data.code === 0) {
              this.$message.success({
                message: '删除成功',
                showClose: true
              })
              this.loadData()
            } else {
              this.$message.error({
                message: data.msg || '删除失败',
                showClose: true
              })
            }
          }
        )
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    handleCurrentChange(page) {
      this.currentPage = page;
      this.$refs.modelTable.clearSelection();
    },
    handleModelSave({ provideCode, formData, done }) {
      const modelType = this.activeTab;
      const id = formData.id;

      if (this.editModelData.duplicateMode) {
        Api.model.addModel({modelType, provideCode, formData},
        ({ data }) => {
          if (data.code === 0) {
            this.$message.success('创建副本成功');
            this.loadData();
            this.editDialogVisible = false;
          } else {
            this.$message.error(data.msg || '创建副本失败');
          }
          done && done(); // 调用done回调关闭加载状态
        })
      }
      else {
        Api.model.updateModel(
          { modelType, provideCode, id, formData },
          ({ data }) => {
            if (data.code === 0) {
              this.$message.success('保存成功');
              this.loadData();
              this.editDialogVisible = false;
            } else {
              this.$message.error(data.msg || '保存失败');
            }
            done && done(); // 调用done回调关闭加载状态
          }
        );
      }
    },
    selectAll() {
      if (this.isAllSelected) {
        this.$refs.modelTable.clearSelection();
      } else {
        this.$refs.modelTable.toggleAllSelection();
      }
    },
    handleSelectionChange(val) {
      this.selectedModels = val;
      this.isAllSelected = val.length === this.modelList.length;
      if (val.length === 0) {
        this.isAllSelected = false;
      }
    },

    // 新增模型配置
    handleAddConfirm(newModel) {
      const params = {
        modelType: this.activeTab,
        provideCode: newModel.provideCode,
        formData: {
          ...newModel,
          isDefault: newModel.isDefault ? 1 : 0,
          isEnabled: newModel.isEnabled ? 1 : 0,
          configJson: newModel.configJson
        }
      };

      Api.model.addModel(params, ({ data }) => {
        if (data.code === 0) {
          this.$message.success({
            message: '新增成功',
            showClose: true
          });
          this.loadData();
        } else {
          this.$message.error({
            message: data.msg || '新增失败',
            showClose: true
          });
        }
      });
    },

    // 分页器
    goFirst() {
      this.currentPage = 1;
      this.loadData();
    },
    goPrev() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadData();
      }
    },
    goNext() {
      if (this.currentPage < this.pageCount) {
        this.currentPage++;
        this.loadData();
      }
    },
    goToPage(page) {
      this.currentPage = page;
      this.loadData();
    },

    // 获取模型配置列表
    loadData() {
      this.loading = true; // 开始加载
      const params = {
        modelType: this.activeTab,
        modelName: this.search,
        page: this.currentPage,
        limit: this.pageSize
      };

      Api.model.getModelList(params, ({ data }) => {
        this.loading = false; // 结束加载
        if (data.code === 0) {
          this.modelList = data.data.list;
          this.total = data.data.total;
        } else {
          this.$message.error(data.msg || '获取模型列表失败');
        }
      });
    },
    // 处理启用/禁用状态变更
    handleStatusChange(model) {
      const newStatus = model.isEnabled ? 1 : 0
      const originalStatus = model.isEnabled

      model.isEnabled = !model.isEnabled

      Api.model.updateModelStatus(
        model.id,
        newStatus,
        ({ data }) => {
          if (data.code === 0) {
            this.$message.success(newStatus === 1 ? '启用成功' : '禁用成功')
            // 保持新状态
            model.isEnabled = newStatus
          } else {
            // 操作失败时恢复原状态
            model.isEnabled = originalStatus
            this.$message.error(data.msg || '操作失败')
          }
        }
      )
    },
    handleDefaultChange(model) {
      Api.model.setDefaultModel(model.id, ({ data }) => {
        if (data.code === 0) {
          this.$message.success('设置默认模型成功')
          this.loadData()
        }
      })
    }
  },
};
</script>

<style scoped lang="scss">
.el-switch {
  height: 23px;
}

::v-deep .el-table tr {
  background: transparent;
}

.welcome {
  min-width: 900px;
  min-height: 506px;
  height: 100vh;
  display: flex;
  position: relative;
  flex-direction: column;
  background: transparent;
  overflow: hidden;
}

.main-wrapper {
  margin: 5px 22px;
  border-radius: var(--glass-radius);
  min-height: calc(100vh - 26vh);
  height: auto;
  max-height: 80vh;
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
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

.content-panel {
  flex: 1;
  display: flex;
  overflow: hidden;
  height: 100%;
  border-radius: 0 0 var(--glass-radius) var(--glass-radius);
  background: transparent;
  border: none;
}

.nav-panel {
  min-width: 242px;
  height: 100%;
  border-right: 1px solid var(--glass-border);
  background: rgba(26, 26, 46, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 16px 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg,
      rgba(201, 102, 255, 0.1) 0%,
      rgba(201, 102, 255, 0.05) 50%,
      transparent 100%);
    border-radius: 0 0 0 var(--glass-radius);
    pointer-events: none;
  }
}

.nav-panel .el-menu-item {
  height: 50px;
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid transparent;
  line-height: 50px;
  border-radius: 8px 0 0 8px !important;
  transition: all 0.3s ease;
  display: flex !important;
  justify-content: flex-end;
  padding-right: 12px !important;
  width: fit-content;
  margin: 8px 0 8px auto;
  min-width: unset;
  position: relative;
  z-index: 2;
  
  &:hover {
    background: rgba(201, 102, 255, 0.2);
    border-color: var(--glass-border);
    box-shadow: 0 0 15px rgba(201, 102, 255, 0.2);
  }
}

.nav-panel .el-menu-item.is-active {
  background: linear-gradient(135deg, var(--primary-purple), #B347E8);
  border: 1px solid var(--primary-purple);
  position: relative;
  padding-left: 40px !important;
  box-shadow: 0 0 20px rgba(201, 102, 255, 0.4);
  
  &:hover {
    background: linear-gradient(135deg, #D985FF, var(--primary-purple));
  }
}

.nav-panel .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 13px;
  height: 13px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}

.menu-text {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: right;
  width: 100%;
  padding-right: 8px;
  transition: color 0.3s ease;
}

.content-area {
  flex: 1;
  padding: 24px;
  height: 100%;
  min-width: 600px;
  overflow: hidden;
  background: rgba(26, 26, 46, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-group {
  display: flex;
  gap: 10px;
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
}

.btn-search:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 20px rgba(201, 102, 255, 0.5);
  background: linear-gradient(135deg, #D985FF, var(--primary-purple));
}

::v-deep .search-input .el-input__inner {
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  background-color: white;
  transition: border-color 0.2s;
}

::v-deep .page-size-select {
  width: 100px;
  margin-right: 8px;
}

::v-deep .page-size-select .el-input__inner {
  height: 32px;
  line-height: 32px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  background: #dee7ff;
  color: #606266;
  font-size: 14px;
}

::v-deep .page-size-select .el-input__suffix {
  right: 6px;
  width: 15px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 6px;
  border-radius: 4px;
}

::v-deep .page-size-select .el-input__suffix-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

::v-deep .page-size-select .el-icon-arrow-up:before {
  content: "";
  display: inline-block;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 9px solid #606266;
  position: relative;
  transform: rotate(0deg);
  transition: transform 0.3s;
}

::v-deep .search-input .el-input__inner:focus {
  border-color: #6b8cff;
  outline: none;
}

.data-table {
  border-radius: 8px;
  overflow: hidden;
  background-color: transparent !important;
  background: rgba(26, 26, 46, 0.2);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid var(--glass-border);
}

.data-table ::v-deep .el-table__row {
  background-color: transparent !important;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(201, 102, 255, 0.1) !important;
  }
}

.table-header th {
  background-color: transparent !important;
  color: var(--text-primary) !important;
  font-weight: 600;
  border-bottom: 1px solid var(--glass-border) !important;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  width: 100%;
  flex-shrink: 0;
  min-height: 60px;
  background: rgba(26, 26, 46, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 0 0 8px 8px;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

.batch-actions .el-button {
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
}

.batch-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 15px rgba(201, 102, 255, 0.4);
}

.batch-actions .el-button--primary {
  background: linear-gradient(135deg, var(--primary-purple), #B347E8) !important;
  color: white;
  border-color: var(--primary-purple);
}

.batch-actions .el-button--success {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border-color: #10B981;
}

.batch-actions .el-button--danger {
  background: linear-gradient(135deg, #EF4444, #DC2626);
  color: white;
  border-color: #EF4444;
}

.batch-actions .el-button:first-child {
  background: linear-gradient(135deg, var(--primary-purple), #B347E8);
  border: 1px solid var(--primary-purple);
  color: white;
}

.batch-actions .el-button:first-child:hover {
  background: linear-gradient(135deg, #D985FF, var(--primary-purple));
}

.el-table th ::v-deep .el-table__cell {
  overflow: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  background-color: transparent !important;
}

::v-deep .el-table .custom-selection-header .cell .el-checkbox__inner {
  display: none !important;
}

::v-deep .el-table .custom-selection-header .cell::before {
  content: '选择';
  display: block;
  text-align: center;
  line-height: 0;
  color: black;
  margin-top: 23px;
}

::v-deep .el-table__body .el-checkbox__inner {
  display: inline-block !important;
  background: #e6edfa;
}

::v-deep .el-table thead th:not(:first-child) .cell {
  color: #303133 !important;
}

::v-deep .nav-panel .el-menu-item.is-active .menu-text {
  color: #fff !important;
}

::v-deep .data-table {

  &.el-table::before,
  &.el-table::after,
  &.el-table__inner-wrapper::before {
    display: none !important;
  }
}

::v-deep .data-table .el-table__header-wrapper {
  border-bottom: 1px solid rgb(224, 227, 237);
}

::v-deep .data-table .el-table__body td {
  border-bottom: 1px solid rgb(224, 227, 237) !important;
}

.el-button img {
  height: 1em;
  vertical-align: middle;
  padding-right: 2px;
  padding-bottom: 2px;
}

::v-deep .el-checkbox__inner {
  border-color: #cfcfcf !important;
  transition: all 0.2s ease-in-out;
}

::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #5f70f3;
  border-color: #5f70f3;
}

.voice-management-btn {
  background: #9db3ea;
  color: white;
  min-width: 68px;
  line-height: 14px;
  white-space: nowrap;
  transition: all 0.3s;
  border-radius: 10px;
}

.voice-management-btn:hover {
  background: #8aa2e0;
  /* 悬停时颜色加深 */
  transform: scale(1.05);
}

::v-deep .el-table .el-table-column--selection .cell {
  padding-left: 15px !important;
}

::v-deep .el-table .el-table__fixed-right .cell {
  padding-right: 15px !important;
}

.edit-btn,
.delete-btn {
  margin: 0 8px;
  color: #7079aa !important;
}

::v-deep .el-table .cell {
  padding-left: 10px;
  padding-right: 10px;
}

/* 分页器 */
.custom-pagination {
  display: flex;
  align-items: center;
  gap: 8px;

  /* 导航按钮样式 (首页、上一页、下一页) */
  .pagination-btn:first-child,
  .pagination-btn:nth-child(2),
  .pagination-btn:nth-child(3),
  .pagination-btn:nth-last-child(2) {
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

  /* 数字按钮样式 */
  .pagination-btn:not(:first-child):not(:nth-child(2)):not(:nth-child(3)):not(:nth-last-child(2)) {
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
    color: var(--text-tertiary);
    font-size: 14px;
    margin-left: 10px;
  }
}

.model-card {
  background: transparent;
  flex: 1;
  display: flex;
  flex-direction: column;
  border: none;
  box-shadow: none;
  overflow: hidden;
}

.model-card ::v-deep .el-card__body {
  padding: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background: transparent;
}

.data-table {
  --table-max-height: calc(100vh - 45vh);
  max-height: var(--table-max-height);
}

.data-table ::v-deep .el-table__body-wrapper {
  max-height: calc(var(--table-max-height) - 80px);
  overflow-y: auto;
}

::v-deep .el-loading-mask {
  background-color: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(2px);
}

::v-deep .el-loading-spinner .circular {
  width: 28px;
  height: 28px;
}

::v-deep .el-loading-spinner .path {
  stroke: #6b8cff;
}

::v-deep .el-loading-text {
  color: #6b8cff !important;
  font-size: 14px;
  margin-top: 8px;
}

// 搜索输入框样式
::v-deep .search-input .el-input__inner {
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

// 页面大小选择器样式
::v-deep .page-size-select .el-input__inner {
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  transition: all 0.3s ease;

  &:hover, &:focus {
    border-color: var(--primary-purple);
    box-shadow: 0 0 10px rgba(201, 102, 255, 0.3);
    color: var(--text-primary);
  }
}

// 复选框样式
::v-deep .el-checkbox__inner {
  background-color: rgba(26, 26, 46, 0.6) !important;
  border-color: var(--glass-border) !important;
  backdrop-filter: blur(5px);
}

::v-deep .el-checkbox__inner:hover {
  border-color: var(--primary-purple) !important;
  box-shadow: 0 0 8px rgba(201, 102, 255, 0.3);
}

::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: var(--primary-purple) !important;
  border-color: var(--primary-purple) !important;
  box-shadow: 0 0 10px rgba(201, 102, 255, 0.4);
}

// 活跃菜单项文字颜色
::v-deep .nav-panel .el-menu-item.is-active .menu-text {
  color: #fff !important;
}

// 表格单元格文字颜色
::v-deep .data-table .el-table td {
  color: var(--text-secondary) !important;
}

// 操作按钮样式
.edit-btn,
.delete-btn {
  color: var(--primary-purple) !important;
  transition: all 0.3s ease;

  &:hover {
    color: #D985FF !important;
    text-shadow: 0 0 8px rgba(201, 102, 255, 0.4);
  }
}

.voice-management-btn {
  background: linear-gradient(135deg, var(--primary-purple), #B347E8);
  border: 1px solid var(--primary-purple);
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(201, 102, 255, 0.3);

  &:hover {
    background: linear-gradient(135deg, #D985FF, var(--primary-purple));
    box-shadow: 0 0 15px rgba(201, 102, 255, 0.5);
    transform: scale(1.05);
  }
}
</style>
