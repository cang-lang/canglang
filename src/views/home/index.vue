<template>
  <el-container class="home">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="./heima.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="width">
        <!-- 侧边栏区域 -->
        <div class="toggle-button" @click="toggle">|||</div>
        <el-menu
          background-color="#001D26"
          text-color="#fff"
          active-text-color="#409EEF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="menu.id + ''" v-for="menu in menulist" :key="menu.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconnsObj[menu.id]"></i>
              <!-- 文本 -->
              <span>{{menu.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              v-for="subItem in menu.children"
              :key="subItem.id + ''"
              :index="'/'+subItem.path"
              @click="saveNavState('/'+subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区域 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data () {
    return {
      menulist: [],
      iconnsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      const {
        data: { data, meta }
      } = await this.$http.get('menus')
      // console.log(data, meta)
      if (meta.status !== 200) return this.$message.error(meta.msg)
      this.menulist = data
    },
    toggle () {
      this.isCollapse = !this.isCollapse
    },
    saveNavState (activePath) {
      sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  computed: {
    width () {
      return this.isCollapse ? '64px' : '200px'
    }
  }
}
</script>
<style lang="less" scoped>
.home {
  height: 100%;
}
.el-header {
  background-color: #001d26;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #001d26;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #08485f;
  text-align: center;
  color: #fff;
  line-height: 24px;
  font-size: 10px;
  letter-spacing: 0.2em;
}
</style>
