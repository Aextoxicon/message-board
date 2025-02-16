**介绍**
这是一个非常非常基本的留言板，也就是输入你的名称和内容然后让他们显示在网页上(登录正在做)

其中`index.html`和`comment.js`以及`style.css`是前端的东西，直接放入网站目录即可
然后就是`backend`里面的东西

- `server.js`是交给后端nodejs运行的

- `.env`是后端连接Postgres字符串的环境变量（process.env.PSQL）

**使用**
后端目录里面的东西全克隆到服务器里面你喜欢的目录，比如说`/opt/backend`

然后关于需要安装的依赖有nodejs以及MongoDB(已弃用，改成Postgres），剩下的npm包可以在后端目录直接`npm install`