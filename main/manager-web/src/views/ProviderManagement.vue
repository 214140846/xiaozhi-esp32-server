<template>
  <div class="welcome">
    <HeaderBar />

    <div class="operation-bar">
      <h2 class="page-title">字段管理</h2>
      <div class="right-operations">
        <el-dropdown trigger="click" @command="handleSelectModelType" @visible-change="handleDropdownVisibleChange">
          <el-button class="category-btn">
            类别筛选 {{ selectedModelTypeLabel }}<i class="el-icon-arrow-down el-icon--right"
              :class="{ 'rotate-down': DropdownVisible }"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="">全部</el-dropdown-item>
            <el-dropdown-item v-for="item in modelTypes" :key="item.value" :command="item.value">
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-input placeholder="请输入供应器名称查询" v-model="searchName" class="search-input" @keyup.enter.native="handleSearch"
          clearable />
        <el-button class="btn-search" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <div class="main-wrapper">
      <div class="content-panel">
        <div class="content-area">
          <el-card class="provider-card" shadow="never">
            <el-table ref="providersTable" :data="filteredProvidersList" class="transparent-table" v-loading="loading"
              element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading"
              element-loading-background="rgba(255, 255, 255, 0.7)" :header-cell-class-name="headerCellClassName">
              <el-table-column label="选择" align="center" width="120">
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.selected"></el-checkbox>
                </template>
              </el-table-column>

              <el-table-column label="类别" prop="modelType" align="center" width="200">
                <template slot="header" slot-scope="scope">
                  <el-dropdown trigger="click" @command="handleSelectModelType"
                    @visible-change="isDropdownOpen = $event">
                    <span class="dropdown-trigger" :class="{ 'active': isDropdownOpen }">
                      类别{{ selectedModelTypeLabel }} <i class="dropdown-arrow"
                        :class="{ 'is-active': isDropdownOpen }"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="">全部</el-dropdown-item>
                      <el-dropdown-item v-for="item in modelTypes" :key="item.value" :command="item.value">
                        {{ item.label }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
                <template slot-scope="scope">
                  <el-tag :type="getModelTypeTag(scope.row.modelType)">
                    {{ getModelTypeLabel(scope.row.modelType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="供应器编码" prop="providerCode" align="center" width="150"></el-table-column>
              <el-table-column label="名称" prop="name" align="center"></el-table-column>
              <el-table-column label="字段配置" align="center">
                <template slot-scope="scope">
                  <el-popover placement="top-start" width="400" trigger="hover">
                    <div v-for="field in scope.row.fields" :key="field.key" class="field-item">
                      <span class="field-label">{{ field.label }}:</span>
                      <span class="field-type">{{ field.type }}</span>
                      <span v-if="isSensitiveField(field.key)" class="sensitive-tag">敏感</span>
                    </div>
                    <el-button slot="reference" size="mini" type="text">查看字段</el-button>
                  </el-popover>
                </template>
              </el-table-column>
              <el-table-column label="排序" prop="sort" align="center" width="80"></el-table-column>
              <el-table-column label="操作" align="center" width="180">
                <template slot-scope="scope">
                  <el-button size="mini" type="text" @click="editProvider(scope.row)">编辑</el-button>
                  <el-button size="mini" type="text" @click="deleteProvider(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="table_bottom">
              <div class="ctrl_btn">
                <el-button size="mini" type="primary" class="select-all-btn" @click="handleSelectAll">
                  {{ isAllSelected ? '取消全选' : '全选' }}
                </el-button>
                <el-button size="mini" type="success" @click="showAddDialog">新增</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteSelectedProviders">删除
                </el-button>
              </div>
              <div class="custom-pagination">
                <el-select v-model="pageSize" @change="handlePageSizeChange" class="page-size-select">
                  <el-option v-for="item in pageSizeOptions" :key="item" :label="`${item}条/页`" :value="item">
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

    <!-- 新增/编辑供应器对话框 -->
    <provider-dialog :title="dialogTitle" :visible.sync="dialogVisible" :form="providerForm" :model-types="modelTypes"
      @submit="handleSubmit" @cancel="dialogVisible = false" />

    <el-footer>
      <version-footer />
    </el-footer>
  </div>
</template>

<script>
import Api from "@/apis/api";
import HeaderBar from "@/components/HeaderBar.vue";
import ProviderDialog from "@/components/ProviderDialog.vue";
import VersionFooter from "@/components/VersionFooter.vue";

export default {
  components: { HeaderBar, ProviderDialog, VersionFooter },
  data() {
    return {
      searchName: "",
      searchModelType: "",
      providersList: [],
      modelTypes: [
        { value: "ASR", label: "语音识别" },
        { value: "TTS", label: "语音合成" },
        { value: "LLM", label: "大语言模型" },
        { value: "VLLM", label: "视觉大语言模型" },
        { value: "Intent", label: "意图识别" },
        { value: "Memory", label: "记忆模块" },
        { value: "VAD", label: "语音活动检测" },
        { value: "Plugin", label: "插件工具" }
      ],
      currentPage: 1,
      loading: false,
      pageSize: 10,
      pageSizeOptions: [10, 20, 50, 100],
      total: 0,
      dialogVisible: false,
      dialogTitle: "新增供应器",
      isAllSelected: false,
      isDropdownOpen: false,
      sensitive_keys: ["api_key", "personal_access_token", "access_token", "token", "secret", "access_key_secret", "secret_key"],
      providerForm: {
        id: null,
        modelType: "",
        providerCode: "",
        name: "",
        fields: [],
        sort: 0
      },
      DropdownVisible: false,
    };
  },
  created() {
    this.fetchProviders();
  },
  computed: {
    selectedModelTypeLabel() {
      if (!this.searchModelType) return "（全部）";
      const selectedType = this.modelTypes.find(item => item.value === this.searchModelType);
      return selectedType ? `（${selectedType.label}）` : "";
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
    },
    filteredProvidersList() {
      return this.providersList;

      // let list = this.providersList.filter(item => {
      //   const nameMatch = item.name.toLowerCase().includes(this.searchName.toLowerCase());
      //   const typeMatch = !this.searchModelType || item.model_type === this.searchModelType;
      //   return nameMatch && typeMatch;
      // });

      // list.sort((a, b) => a.sort - b.sort);

      // // 分页处理
      // const start = (this.currentPage - 1) * this.pageSize;
      // return list.slice(start, start + this.pageSize);
    }
  },
  methods: {
    fetchProviders() {
      this.loading = true;

      Api.model.getModelProvidersPage(
        {
          page: this.currentPage,
          limit: this.pageSize,
          name: this.searchName,
          modelType: this.searchModelType
        },
        ({ data }) => {
          this.loading = false;
          if (data.code === 0) {
            this.providersList = data.data.list.map(item => {
              return {
                ...item,
                selected: false,
                fields: JSON.parse(item.fields)
              };
            });
            this.total = data.data.total;
          } else {
            this.$message.error({
              message: data.msg || '获取参数列表失败'
            });
          }
        }
      );
    },
    handleSearch() {
      this.currentPage = 1;
      this.fetchProviders();
    },
    handleSelectModelType(value) {
      this.isDropdownOpen = false;
      this.searchModelType = value;
      this.handleSearch();
    },
    handleSelectAll() {
      this.isAllSelected = !this.isAllSelected;
      this.providersList.forEach(row => {
        row.selected = this.isAllSelected;
      });
    },
    showAddDialog() {
      this.dialogTitle = "新增供应器";
      this.providerForm = {
        id: null,
        modelType: "",
        providerCode: "",
        name: "",
        fields: [],
        sort: 0
      };
      this.dialogVisible = true;
    },
    editProvider(row) {
      this.dialogTitle = "编辑供应器";
      this.providerForm = {
        ...row,
        fields: JSON.parse(JSON.stringify(row.fields))
      };
      this.dialogVisible = true;
    },
    handleSubmit({ form, done }) {
      this.loading = true;
      if (form.id) {
        // 编辑
        Api.model.updateModelProvider(form, ({ data }) => {

          if (data.code === 0) {
            this.fetchProviders(); // 刷新表格
            this.$message.success({
              message: "修改成功",
              showClose: true
            });
          }
        });
      } else {
        // 新增
        Api.model.addModelProvider(form, ({ data }) => {
          if (data.code === 0) {
            this.fetchProviders(); // 刷新表格
            this.$message.success({
              message: "新增成功",
              showClose: true
            });
            this.total += 1;
          }
        });
      }
      this.loading = false;
      this.dialogVisible = false;
      done && done();
    },
    deleteSelectedProviders() {
      const selectedRows = this.providersList.filter(row => row.selected);
      if (selectedRows.length === 0) {
        this.$message.warning({
          message: "请先选择需要删除的供应器",
          showClose: true
        });
        return;
      }
      this.deleteProvider(selectedRows);
    },
    deleteProvider(row) {
      const providers = Array.isArray(row) ? row : [row];
      const providerCount = providers.length;

      this.$confirm(`确定要删除选中的${providerCount}个供应器吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const ids = providers.map(provider => provider.id);
        Api.model.deleteModelProviderByIds(ids, ({ data }) => {
          if (data.code === 0) {

            this.isAllSelected = false;
            this.fetchProviders(); // 刷新表格

            this.$message.success({
              message: `成功删除${providerCount}个参数`,
              showClose: true
            });
          } else {
            this.$message.error({
              message: data.msg || '删除失败，请重试',
              showClose: true
            });
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
          showClose: true,
          duration: 1000
        });
      });
    },
    getModelTypeTag(type) {
      const typeMap = {
        'ASR': 'success',
        'TTS': 'warning',
        'LLM': 'danger',
        'Intent': 'info',
        'Memory': '',
        'VAD': 'primary'
      };
      return typeMap[type] || '';
    },
    getModelTypeLabel(type) {
      const typeItem = this.modelTypes.find(item => item.value === type);
      return typeItem ? typeItem.label : type;
    },
    isSensitiveField(fieldKey) {
      if (typeof fieldKey !== 'string') return false;
      return this.sensitive_keys.some(key =>
        fieldKey.toLowerCase().includes(key.toLowerCase())
      );
    },
    handlePageSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.fetchProviders();
    },
    headerCellClassName({ columnIndex }) {
      if (columnIndex === 0) {
        return "custom-selection-header";
      }
      return "";
    },
    goFirst() {
      this.currentPage = 1;
      this.fetchProviders();
    },
    goPrev() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchProviders();
      }
    },
    goNext() {
      if (this.currentPage < this.pageCount) {
        console.log("this.currentPage", this.currentPage);
        this.currentPage++;
        this.fetchProviders();
      }
    },
    goToPage(page) {
      this.currentPage = page;
      this.fetchProviders();
    },
    handleDropdownVisibleChange(visible) {
      this.DropdownVisible = visible;
    },
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

.category-btn {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(201, 102, 255, 0.3);
  color: #F8FAFC;
  border-radius: 8px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(201, 102, 255, 0.2);
    border-color: #C966FF;
    box-shadow: 0 0 10px rgba(201, 102, 255, 0.3);
  }
  
  .el-icon-arrow-down {
    color: #C966FF;
    transition: transform 0.3s ease;
    
    &.rotate-down {
      transform: rotate(180deg);
    }
  }
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

.el-card {
  border: none;
}

.provider-card {
  background: transparent;
  flex: 1;
  display: flex;
  flex-direction: column;
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
    border-radius: 8px;
    line-height: 1;
    font-weight: 500;
    border: 1px solid rgba(201, 102, 255, 0.3);
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 15px rgba(201, 102, 255, 0.4);
    }
  }

  .el-button--primary {
    background: linear-gradient(135deg, #C966FF, #B347E8);
    color: white;
    box-shadow: 0 0 10px rgba(201, 102, 255, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #D985FF, #C966FF);
    }
  }

  .el-button--success {
    background: linear-gradient(135deg, #10B981, #059669);
    color: white;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #34D399, #10B981);
    }
  }

  .el-button--danger {
    background: linear-gradient(135deg, #EF4444, #DC2626);
    color: white;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #F87171, #EF4444);
    }
  }
}

.custom-pagination {
  display: flex;
  align-items: center;
  gap: 8px;

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
    border: 1px solid rgba(201, 102, 255, 0.3);
    background: rgba(26, 26, 46, 0.8);
    color: #CBD5E1;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    &:hover {
      background: rgba(201, 102, 255, 0.2);
      border-color: #C966FF;
      color: #F8FAFC;
      box-shadow: 0 0 10px rgba(201, 102, 255, 0.3);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      color: #64748B;
    }
  }

  .pagination-btn:not(:first-child):not(:nth-child(3)):not(:nth-child(2)):not(:nth-last-child(2)) {
    min-width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 8px;
    border: 1px solid rgba(201, 102, 255, 0.2);
    background: rgba(26, 26, 46, 0.6);
    color: #CBD5E1;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);

    &:hover {
      background: rgba(201, 102, 255, 0.2);
      border-color: #C966FF;
      color: #F8FAFC;
    }
  }

  .pagination-btn.active {
    background: linear-gradient(135deg, #C966FF, #B347E8) !important;
    color: #ffffff !important;
    border-color: #C966FF !important;
    box-shadow: 0 0 15px rgba(201, 102, 255, 0.4) !important;

    &:hover {
      background: linear-gradient(135deg, #D985FF, #C966FF) !important;
    }
  }

  .total-text {
    color: #CBD5E1;
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
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #34D399, #10B981);
  }
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

.field-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(201, 102, 255, 0.2);
  display: flex;
  align-items: center;
  background: rgba(26, 26, 46, 0.6);
  margin-bottom: 4px;
  border-radius: 8px;
  padding: 8px 12px;

  .field-label {
    flex: 1;
    font-weight: bold;
    color: #F8FAFC;
  }

  .field-type {
    width: 80px;
    color: #CBD5E1;
    font-size: 13px;
    background: rgba(201, 102, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid rgba(201, 102, 255, 0.3);
  }

  .sensitive-tag {
    margin-left: 10px;
    color: #EF4444;
    font-size: 12px;
    background: rgba(239, 68, 68, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid rgba(239, 68, 68, 0.3);
    font-weight: 500;
  }
}

.dropdown-trigger {
  font-size: 14px;
  color: #F8FAFC;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    color: #C966FF;
    text-shadow: 0 0 8px rgba(201, 102, 255, 0.3);
  }
}

.dropdown-trigger.active {
  color: #C966FF;
  text-shadow: 0 0 10px rgba(201, 102, 255, 0.4);
}

.dropdown-arrow {
  display: inline-block;
  margin-left: 5px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 7px solid #C966FF;
  position: relative;
  transition: transform 0.3s ease;
  transform: rotate(0deg);

  &.is-active {
    transform: rotate(180deg);
    border-top-color: #D985FF;
    filter: drop-shadow(0 0 5px rgba(201, 102, 255, 0.5));
  }
}

.rotate-down {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

:deep(.el-tag) {
  background: rgba(26, 26, 46, 0.8) !important;
  border: 1px solid rgba(201, 102, 255, 0.3) !important;
  color: #F8FAFC !important;
  border-radius: 6px;
  padding: 4px 8px;
  
  &.el-tag--success {
    background: rgba(16, 185, 129, 0.2) !important;
    border-color: rgba(16, 185, 129, 0.5) !important;
    color: #10B981 !important;
  }
  
  &.el-tag--warning {
    background: rgba(245, 158, 11, 0.2) !important;
    border-color: rgba(245, 158, 11, 0.5) !important;
    color: #F59E0B !important;
  }
  
  &.el-tag--danger {
    background: rgba(239, 68, 68, 0.2) !important;
    border-color: rgba(239, 68, 68, 0.5) !important;
    color: #EF4444 !important;
  }
  
  &.el-tag--info {
    background: rgba(59, 130, 246, 0.2) !important;
    border-color: rgba(59, 130, 246, 0.5) !important;
    color: #3B82F6 !important;
  }
  
  &.el-tag--primary {
    background: rgba(201, 102, 255, 0.2) !important;
    border-color: rgba(201, 102, 255, 0.5) !important;
    color: #C966FF !important;
  }
}

:deep(.el-dropdown-menu) {
  background: rgba(26, 26, 46, 0.95) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(201, 102, 255, 0.3) !important;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(201, 102, 255, 0.2) !important;
  
  .el-dropdown-menu__item {
    color: #CBD5E1 !important;
    transition: all 0.3s ease;
    border-radius: 8px;
    margin: 4px 8px;
    
    &:hover {
      background: rgba(201, 102, 255, 0.2) !important;
      color: #F8FAFC !important;
      transform: translateX(4px);
    }
  }
}

:deep(.el-popover) {
  background: rgba(26, 26, 46, 0.95) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(201, 102, 255, 0.3) !important;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(201, 102, 255, 0.2) !important;
  color: #CBD5E1 !important;
}

.el-icon-arrow-down {
  transition: transform 0.3s ease;
  color: #C966FF !important;
}
</style>