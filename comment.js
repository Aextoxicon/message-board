document.addEventListener('DOMContentLoaded', () => {
    const inputElement1 = document.getElementById('title');
    const inputElement2 = document.getElementById('commit');
    const displayCommitElement = document.getElementById('display-commit');
    const submitBtn = document.getElementById('submitBtn');
    const commentsContainer = document.getElementById('comments-container');
    const backendApiUrl = process.env.BACKEND; // 后端地址

    // 初始化时加载评论
    loadComments();

    submitBtn.addEventListener('click', async () => {
        const title = inputElement1.value.trim();
        const comment = inputElement2.value.trim();

        // 前端输入验证
        if (!title || !comment) {
            alert('请输入名称和评论');
            return;
        }

        // 防止恶意输入（如脚本标签）
        if (title.includes('<') || comment.includes('<')) {
            alert('输入内容包含非法字符');
            return;
        }

        try {
            const response = await fetch(backendApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    comment
                })
            });

            if (response.ok) {
                console.error('评论已成功提交');
                inputElement1.value = '';
                inputElement2.value = '';
                loadComments(); // 重新加载评论
            } else {
                const errorData = await response.json();
                console.error('提交评论失败', errorData.message);
                alert(errorData.message);
            }
        } catch (error) {
            console.error('网络错误:', error);
            alert('网络错误');
        }
    });

    async function loadComments() {
        try {
            const response = await fetch(backendApiUrl);
            const comments = await response.json();
            commentsContainer.innerHTML = ''; // 清空现有评论

            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment-item';

                // 使用 textContent 防止 XSS
                const nameElement = document.createElement('div');
                nameElement.className = 'comment-name';
                nameElement.textContent = comment.title;

                const contentElement = document.createElement('div');
                contentElement.className = 'comment-content';
                contentElement.textContent = comment.comment;

                const timestampElement = document.createElement('div');
                timestampElement.className = 'comment-timestamp';
                timestampElement.textContent = new Date(comment.timestamp).toLocaleString();

                commentElement.appendChild(nameElement);
                commentElement.appendChild(contentElement);
                commentElement.appendChild(timestampElement);
                commentsContainer.appendChild(commentElement);
            });
        } catch (error) {
            console.error('加载评论失败:', error);
            alert('加载评论失败');
        }
    }
});