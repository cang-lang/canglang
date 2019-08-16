<template>
  <div class="roles">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList" stripe border style="width:100%">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="socpe">
            <el-row v-for="(item1,i1) in socpe.row.children" :key="item1.id">
              <!-- 第一列 -->
              <el-col :span="5">
                <el-tag
                  type="primary"
                  closable
                  @close="removeRightById(socpe.row,item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 第二类 -->
              <el-col :span="19">
                <!-- 二级列表 -->
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="5">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(socpe.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级列表 -->
                  <el-col :span="19">
                    <el-tag
                      type="warning"
                      v-for="(item3,i3) in item2.children "
                      :key="item3.id"
                      closable
                      @close="removeRightById(socpe.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre> {{socpe.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色权限"></el-table-column>
        <el-table-column label="操作" width="340px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!--树形结构 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        ref="treeRef"
        :default-checked-keys="defKeys"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      rolesList: [],
      rightslist: [],
      defKeys: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      treeProps: { children: 'children', label: 'authName' },
      // 当前即将分配权限的角色id
      roleId: ''
    }
  },
  methods: {
    // 获取所有角色的列表
    async getrolesList () {
      const {
        data: { data, meta }
      } = await this.$http.get('roles')
      if (meta.status !== 200) return this.$message.error(meta.msg)
      this.rolesList = data
      console.log(this.rolesList)
    },
    // 展开列删除列
    async removeRightById (role, rightId) {
      try {
        await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const {
          data: { data, meta }
        } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (meta.status !== 200) return this.$message.error('删除权限失败')
        // console.log(data)
        role.children = data
        // console.log(res)  //confirm
      } catch (error) {
        this.$message.info('取消删除')
      }
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
    // 把分配权限的角色id存入roleId中
      this.roleId = role.id
      // 获取树状型数据
      const {
        data: { data, meta }
      } = await this.$http.get('rights/tree')
      this.rightslist = data
      // console.log(this.rightslist)
      // console.log(role)

      // 调用默认角色选中的id函数

      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed () {
      this.defKeys = []
    },
    getLeafKeys (node, arr) {
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: { data, meta } } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      // 重新加载权限页面
      this.getrolesList()
      // 关闭权限分配对话框
      this.setRightDialogVisible = false
    }
  },
  created () {
    this.getrolesList()
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
