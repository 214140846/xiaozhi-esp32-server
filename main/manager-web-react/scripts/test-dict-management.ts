/**
 * 字典管理功能测试脚本
 * 测试字典类型和字典数据的 CRUD 操作
 */
import { dictAPI } from '../src/api/dictApi';
import type { DictTypeForm, DictDataForm } from '../src/types/dict';

// 测试数据
const testDictType: DictTypeForm = {
  dictName: '测试字典类型',
  dictType: 'test_dict_type'
};

const testDictData: DictDataForm = {
  dictTypeId: 0, // 将在测试中设置
  dictLabel: '测试标签',
  dictValue: 'test_value',
  sort: 1
};

async function testDictManagement() {
  console.log('开始测试字典管理功能...\n');

  try {
    // ==================== 测试字典类型 ====================
    console.log('1. 测试字典类型管理');

    // 1.1 获取字典类型列表
    console.log('1.1 获取字典类型列表');
    const typeListResult = await dictAPI.getDictTypeList({ page: 1, limit: 10 });
    console.log('字典类型列表:', typeListResult);

    // 1.2 新增字典类型
    console.log('\n1.2 新增字典类型');
    const addTypeResult = await dictAPI.addDictType(testDictType);
    console.log('新增字典类型结果:', addTypeResult);

    // 获取新增的字典类型ID (模拟)
    const newTypeListResult = await dictAPI.getDictTypeList({ 
      page: 1, 
      limit: 10, 
      dictName: testDictType.dictName 
    });
    const newDictType = newTypeListResult.data.list.find(
      item => item.dictName === testDictType.dictName
    );
    
    if (!newDictType) {
      throw new Error('未找到新增的字典类型');
    }

    console.log('新增的字典类型:', newDictType);

    // 1.3 更新字典类型
    console.log('\n1.3 更新字典类型');
    const updateTypeData: DictTypeForm = {
      id: newDictType.id,
      dictName: '更新后的测试字典类型',
      dictType: testDictType.dictType
    };
    const updateTypeResult = await dictAPI.updateDictType(updateTypeData);
    console.log('更新字典类型结果:', updateTypeResult);

    // ==================== 测试字典数据 ====================
    console.log('\n2. 测试字典数据管理');

    // 2.1 获取字典数据列表
    console.log('2.1 获取字典数据列表');
    const dataListResult = await dictAPI.getDictDataList({
      dictTypeId: newDictType.id,
      page: 1,
      limit: 10
    });
    console.log('字典数据列表:', dataListResult);

    // 2.2 新增字典数据
    console.log('\n2.2 新增字典数据');
    const testDataWithTypeId: DictDataForm = {
      ...testDictData,
      dictTypeId: newDictType.id
    };
    const addDataResult = await dictAPI.addDictData(testDataWithTypeId);
    console.log('新增字典数据结果:', addDataResult);

    // 获取新增的字典数据
    const newDataListResult = await dictAPI.getDictDataList({
      dictTypeId: newDictType.id,
      page: 1,
      limit: 10
    });
    const newDictData = newDataListResult.data.list.find(
      item => item.dictLabel === testDictData.dictLabel
    );

    if (newDictData) {
      // 2.3 更新字典数据
      console.log('\n2.3 更新字典数据');
      const updateDataData: DictDataForm = {
        id: newDictData.id,
        dictTypeId: newDictType.id,
        dictLabel: '更新后的测试标签',
        dictValue: 'updated_test_value',
        sort: 2
      };
      const updateDataResult = await dictAPI.updateDictData(updateDataData);
      console.log('更新字典数据结果:', updateDataResult);

      // 2.4 删除字典数据
      console.log('\n2.4 删除字典数据');
      const deleteDataResult = await dictAPI.deleteDictData([newDictData.id]);
      console.log('删除字典数据结果:', deleteDataResult);
    }

    // 1.4 删除字典类型
    console.log('\n1.4 删除字典类型');
    const deleteTypeResult = await dictAPI.deleteDictType([newDictType.id]);
    console.log('删除字典类型结果:', deleteTypeResult);

    console.log('\n✅ 所有测试通过!');

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    
    if (error instanceof Error) {
      console.error('错误消息:', error.message);
      console.error('错误堆栈:', error.stack);
    }
  }
}

// 运行测试
testDictManagement();