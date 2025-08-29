document.addEventListener('DOMContentLoaded', () => {
    const postTitleElement = document.getElementById('post-title'); // <h1> 标题
    const postContainer = document.getElementById('post-container');
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        alert('无效的帖子 ID');
        window.location.href = '/'; // 返回留言板首页
        return;
    }

    // 加载帖子详情
    async function loadPost() {
        try {
            const backendApiUrl = `https://your_host.com/api/comments/${postId}`; // 假设后端支持 `/api/comments/:id`
            const response = await fetch(backendApiUrl);

            if (!response.ok) {
                throw new Error('加载帖子失败，请刷新重试');
            }

            const post = await response.json();

            // 动态设置 <title> 标签
            document.title = post.title || '帖子详情';

            // 动态设置 <h1> 标题
            postTitleElement.textContent = post.title;
            postTitleElement.className = 'comment-title'; // 添加与主页相同的标题样式

            // 渲染帖子内容
            renderPost(post);
        } catch (error) {
            console.error('加载帖子失败:', error);
            alert('加载帖子失败');
        }
    }

    // 渲染帖子内容
    function renderPost(post) {
        // 显示内容（支持 Markdown 并防止 XSS 攻击）
        const contentElement = document.createElement('div');
        contentElement.className = 'comment-content'; // 借用标题样式类
        const htmlContent = marked.parse(post.comment);
        contentElement.innerHTML = DOMPurify.sanitize(htmlContent);

        // 显示时间戳
        const timestampElement = document.createElement('div');
        timestampElement.className = 'comment-timestamp'; // 使用与主页相同的时间戳样式类
        timestampElement.textContent = new Date(post.timestamp).toLocaleString();

        // 清空容器
        postContainer.innerHTML = '';
        
        // 将各部分添加到容器中
        postContainer.appendChild(contentElement);
        postContainer.appendChild(timestampElement);
    }

    // 初始化时加载帖子
    loadPost();
});
