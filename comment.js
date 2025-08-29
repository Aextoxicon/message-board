// 确保 DOM 已经加载完成
document.addEventListener('DOMContentLoaded', () => {
    const inputElement1 = document.getElementById('title'); // 标题输入框
    const inputElement2 = document.getElementById('comment'); // 评论内容输入框
    const submitBtn = document.getElementById('submitBtn'); // 提交按钮
    const commentsContainer = document.getElementById('comments-container'); // 评论容器
    const paginationContainer = document.getElementById('pagination'); // 分页容器
    const backendApiUrl = 'https://your_host.com/api/comments'; // 后端 API 地址
    let currentPage = 1; // 当前页码
    const limit = 6; // 每页显示的评论数

    // 渲染评论
    function renderComments(comments) {
        commentsContainer.innerHTML = ''; // 清空现有评论
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';

            // 显示标题
            const nameElement = document.createElement('a');
            nameElement.className = 'comment-title';
            nameElement.textContent = comment.title;
            nameElement.href = `post.html?id=${comment.id}`; // 设置链接地址
            nameElement.style.textDecoration = 'none'; // 去掉下划线
            nameElement.style.color = '#000000'; // 设置标题为黑色
            commentElement.appendChild(nameElement); // 将链接直接添加到评论项中

            // 显示内容（支持 Markdown 并防止 XSS 攻击）
            const contentElement = document.createElement('div');
            contentElement.className = 'comment-content';
            const htmlContent = marked.parse(comment.comment);
            contentElement.innerHTML = DOMPurify.sanitize(htmlContent);

            // 显示时间戳
            const timestampElement = document.createElement('div');
            timestampElement.className = 'comment-timestamp';
            timestampElement.textContent = new Date(comment.timestamp).toLocaleString();

            // 将各部分添加到评论项中
            commentElement.appendChild(contentElement);
            commentElement.appendChild(timestampElement);

            // 添加到评论容器
            commentsContainer.appendChild(commentElement);
        });
    }

    // 加载评论
    async function loadComments(page) {
        try {
            const response = await fetch(`${backendApiUrl}?page=${page}&limit=${limit}`);
            if (!response.ok) {
                throw new Error('JavaScript 加载失败，请刷新再试');
            }
            const result = await response.json();
            const { data, pagination } = result;

            // 更新当前页码
            currentPage = pagination.currentPage;

            // 渲染评论和分页
            renderComments(data);
            renderPagination(pagination);
        } catch (error) {
            console.error('加载评论失败:', error);
            alert('加载评论失败');
        }
    }

    // 初始化时加载评论
    loadComments(currentPage);

    // 提交评论相关的代码将从这里移除
    submitBtn.addEventListener('click', async () => {
        const title = inputElement1.value.trim();
        const commentText = inputElement2.value.trim(); // 获取评论内容

        if (!title || !commentText) {
            alert('请填写标题和评论内容。'); // 简单的前端验证
            return;
        }

        try {
            const response = await fetch(backendApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: title, comment: commentText }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('提交评论失败:', errorData);
                alert('提交评论失败'); // 可以考虑更友好的错误提示
                return;
            }

            // 提交成功后的处理
            inputElement1.value = ''; // 清空标题输入框
            inputElement2.value = ''; // 清空评论输入框
            loadComments(1).then(() => { // 重置到第一页，以便查看新评论
                // 滚动到网页顶部
                window.scrollTo({
                    top: 0,
                });
            }).catch(error => {
                console.error("加载评论失败:", error);
            });
        } catch (error) {
            console.error('提交评论失败:', error);
            alert('提交评论失败');
        }
    });

    // 渲染分页按钮
    function renderPagination(pagination) {
        paginationContainer.innerHTML = ''; // 清空旧分页

        // 上一页按钮
        if (pagination.currentPage > 1) {
            const prevPage = document.createElement('button');
            prevPage.classList.add("prev-page-btn");
            prevPage.textContent = "上一页";
            prevPage.addEventListener('click', () => {
                currentPage = pagination.currentPage - 1;
                loadComments(currentPage);
            });
            paginationContainer.appendChild(prevPage);
        } else {
            const firstPage = document.createElement('button');
            firstPage.classList.add("prev-page-btn", "disabled");
            firstPage.textContent = "已是最前一页";
            firstPage.disabled = true;
            paginationContainer.appendChild(firstPage);
        }

        // 显示分页信息
        const pageInfo = document.createElement('div');
            pageInfo.className = 'page-info';  // 添加类名
            pageInfo.textContent = `${pagination.currentPage}/${pagination.totalPages}页`;
        paginationContainer.appendChild(pageInfo);

        // 下一页按钮
        if (pagination.currentPage < pagination.totalPages) {
            const nextPage = document.createElement('button');
            nextPage.classList.add("next-page-btn");
            nextPage.textContent = "下一页";
            nextPage.addEventListener('click', () => {
                currentPage = pagination.currentPage + 1;
                loadComments(currentPage);
            });
            paginationContainer.appendChild(nextPage);
        } else {
            const lastPage = document.createElement('button');
            lastPage.classList.add("next-page-btn", "disabled");
            lastPage.textContent = "已是最后一页";
            lastPage.disabled = true;
            paginationContainer.appendChild(lastPage);
        }
    }
});
