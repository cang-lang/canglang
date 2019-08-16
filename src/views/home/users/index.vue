<template>
  <div class="users">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="9">
          <!-- 搜索与添加项目 -->
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="querInof.query"
            clearable
            @clear="getUsers"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUsers"></el-button>
          </el-input>
        </el-col>
        <!-- 添加按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表 -->
      <el-table :data="usersList" stripe border style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态" width="180">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStareChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInof.pagenum"
        :page-sizes="[1, 2, 3, 5]"
        :page-size="querInof.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加信息" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户信息对话框 -->
    <el-dialog title="提示" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <!-- 底部 -->
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRolelDialogVisible" width="50%" @close="colseRolelDialogVisible">
      <!-- 主体内容区域 -->
      <div>
        <p>当前用户 : {{userInfo.username}}</p>
        <p>当前角色 : {{userInfo.role_name}}</p>
        <p>
          分配新角色 :
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              e
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolelDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      userInfo: {},
      usersList: [],
      rolesList: [],
      querInof: {
        query: '',
        pagenum: 1,
        pagesize: 3
      },
      total: 0,
      // 控制用户信息对话框显示与否
      addDialogVisible: false,
      // 控制修改用户信息对话框显示与否
      editDialogVisible: false,
      setRolelDialogVisible: false,
      selectRoleId: '',
      // 添加用户表单信息
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {},
      addFormRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ], // 验证密码
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        // 验证邮箱
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        // 验证手机号码
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editFormRules: {
        // 验证邮箱
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        // 验证手机号码
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取用户列表请求
    async getUsers () {
      const {
        data: { data, meta }
      } = await this.$http.get('users', { params: this.querInof })
      if (meta.status !== 200) return this.$message.error(meta.msg)
      this.usersList = data.users
      this.total = data.total
      // console.log(data)
    },
    // 显示页码大小数
    handleSizeChange (newPagesize) {
      // console.log(newPagesize)
      this.querInof.pagesize = newPagesize
      this.getUsers()
    },
    // 当前页码
    handleCurrentChange (newPagenum) {
      // console.log(newPagenum)
      this.querInof.pagenum = newPagenum
      this.getUsers()
    },
    // 用户状态改变
    async userStareChange (useinfo) {
      // console.log(useinfo)
      const {
        data: { data, meta }
      } = await this.$http.put(`users/${useinfo.id}/state/${useinfo.mg_state}`)
      if (meta.status !== 200) {
        useinfo.mg_state = !useinfo.mg_state
        return this.$message.error(meta.msg)
      }
      this.$message.success('更新状态成功')
    },
    // 关闭重置验证
    addDialogClosed () {
      // console.log(this.$refs)
      this.$refs.addFormRef.resetFields()
    },
    // 编辑用户关闭窗口
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 添加用户确定按钮进行预验证，并且发送ajax
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const {
          data: { data, meta }
        } = await this.$http.post('users/', this.addForm)
        if (meta.status !== 201) return this.$message.error(meta.msg)
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        this.getUsers()
      })
    },
    editUser () {
      this.$refs.editFormRef.validate(async vaild => {
        if (!vaild) return
        const {
          data: { data, meta }
        } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (meta.status !== 200) return this.$message.error(meta.msg)
        this.$message.success('添加用户成功')
        this.editDialogVisible = false
        this.getUsers()
      })
    },
    // 点击删除按钮
    // async removeUserById (id) {
    //   // console.log(id)
    //   const res = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).catch(err => err)
    //   if (res !== 'confirm') {
    //     return this.$message.info('取消了删除')
    //   }
    //   // 发送ajax
    //   const { data: { data, meta } } = await this.$http.delete('users/' + id)
    //   if (meta.status !== 200) return this.$message.error(meta.msg)
    //   this.$message.success('删除成功')
    //   this.getUsers()
    // },
    async removeUserById (id) {
      try {
        // console.log(id)
        await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const {
          data: { data, meta }
        } = await this.$http.delete('users/' + id)
        if (meta.status !== 200) return this.$message.error(meta.msg)
        this.$message.success('删除成功')
        this.getUsers()
      } catch (error) {
        return this.$message.info('取消了删除')
      }
    },

    // 展示编辑对话框
    async showEditDialog (id) {
      this.editDialogVisible = true
      const {
        data: { data, meta }
      } = await this.$http.get(`users/${id}`)
      if (meta.status !== 200) return this.$message.error(meta.msg)
      this.editForm = data
    },
    // 监听分配权限事件
    async setRole (userInfo) {
      this.userInfo = userInfo
      const {
        data: { data, meta }
      } = await this.$http.get('roles')
      if (meta.status !== 200) return this.$message.error('获取角色信息失败')
      // 把所有角色信息放入data中
      this.rolesList = data
      this.setRolelDialogVisible = true
    },
    async saveRoleInfo () {
      if (!this.selectRoleId) return this.$message.error('请选择用户角色')

      const {
        data: { data, meta }
      } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectRoleId
      })
      if (meta.status !== 200) return this.$message.error('跟新角色失败')
      this.$message.success('更新角色成功')
      this.getUsers()
      this.setRolelDialogVisible = false
    },
    colseRolelDialogVisible () {
      this.selectRoleId = ''
    }
  },
  created () {
    // 获取用户列表
    this.getUsers()
    this.userInfo = {}
  }
}
</script>
<style lang="less" scoped>
</style>
