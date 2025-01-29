document.addEventListener('DOMContentLoaded', () => {
    const inputElement1 = document.getElementById('name');
    const inputElement2 = document.getElementById('commit');
    const displayCommitElement = document.getElementById('display-commit');
    const submitBtn = document.getElementById('submitBtn');
    const commentsContainer = document.getElementById('comments-container');
    const backendApiUrl = ; // 示例地址'https://mbback.lwh2008.us.kg/api/comments'
    // 初始化时加载评论
    loadComments();
    submitBtn.addEventListener('click', async () => {
        const name = inputElement1.value.trim();
        const comment = inputElement2.value.trim();
        if (name && comment) {
            try {
                const response = await fetch(backendApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        comment
                    })
                });
                if (response.ok) {
                    console.error('留言已成功提交');
                    inputElement1.value = '';
                    inputElement2.value = '';
                    updateDisplayCommit();
                    loadComments(); // 重新加载
                } else {
                    const errorData = await response.json();
                    console.error('提交评论失败', errorData.message);
                    alert(errorData.message);
                }
            } catch (error) {
                console.error('网络错误:', error);
                alert('网络错误');
            }
        } else {
            alert('请输入名称和留言');
        }
    });
    function updateDisplayCommit() {
        const name = inputElement1.value;
        const comment = inputElement2.value;
        displayCommitElement.innerText = `${name}\n${comment}`;
    }
    async function loadComments() {
        try {
            const response = await fetch(backendApiUrl);
            const comments = await response.json();
            commentsContainer.innerHTML = ''; // 清空现有留言
            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment-item'; // 添加类名
                commentElement.innerHTML = `
                    <div class="comment-name">${comment.name}</div>
                    <div class="comment-content">${comment.comment}</div>
                    <div class="comment-timestamp">${new Date(comment.timestamp).toLocaleString()}</div>`;
                commentsContainer.appendChild(commentElement);
           });
        } catch (error) {
            console.error('加载留言失败:', error);
            alert('加载留言失败');
        }
    }
});
