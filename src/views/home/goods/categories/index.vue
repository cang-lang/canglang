<template>
  <div class="categories">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showCatedialogVisible">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 树状表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        show-index
        border
        :selection-type="false"
        :expand-type="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i style="color:lightgreen" class="el-icon-success" v-if="scope.row.cat_deleted===false"></i>
          <i style="color:red" class="el-icon-error" v-else></i>
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCatedialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 主体内容区域 -->
      <el-form :model="addCateForm" :rules="addCaterules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options用来绑定数据源 -->
          <!-- props用来指定配置对潒 -->
          <el-cascader
            expand-trigger="hover"
            :options="ParentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      cateList: [],
      // 查询数据
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总数居条数
      total: 0,
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否分类',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCatedialogVisible: false,
      // 添加分类表单数据
      addCateForm: {
        // 父级分类的id
        cat_pid: 0,
        // 将要添加分类的名称
        cat_name: '',
        // 分类的等级，默认要添加的的是1级分类
        cat_level: 0
      },
      // 添加分类表单验证规则
      addCaterules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 5, message: '长度在 1 到 5 个字符', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      ParentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    }
  },
  methods: {
    // 获取商品数据列表
    async getCateList () {
      const {
        data: { data, meta }
      } = await this.$http.get('categories', { params: this.queryInfo })
      if (meta.status !== 200) return this.$message.error(meta.msg)
      this.cateList = data.result
      this.total = data.total
      // console.log(this.cateList)
    },
    // 监听pagesize的变化
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum的变化
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const {
        data: { data, meta }
      } = await this.$http.get('categories', { params: { type: 2 } })
      if (meta.status !== 200) return this.$message.error('获取数据失败')
      this.ParentCateList = data
      console.log(this.ParentCateList)
    },
    // 点击按钮，控制添加分类的显示与隐藏
    showCatedialogVisible () {
      this.getParentCateList()
      this.addCatedialogVisible = true
    },
    // 选择项发生变化触发这个函数
    parentCateChanged () {
      // console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    addCate () {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: { data, meta } } = await this.$http.post('categories', this.addCateForm)

        if (meta.status !== 201) return this.$message.error(meta.msg)
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCatedialogVisible = false
      })
    },
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  },

  created () {
    this.getCateList()
  }
}
</script>
<style lang="less" scoped>
.zk-table {
  margin: 15px 0;
}
.el-cascader {
  width: 100%;
}
</style>
