document.addEventListener('DOMContentLoaded', () => {
    const inputElement1 = document.getElementById('title'); // 标题输入框
    const inputElement2 = document.getElementById('comment'); // 评论内容输入框
    const backendApiUrl = 'https://your_host.com/api/comments'; // 后端 API 地址

    // 提交评论
    (document.getElementById('push-btn')).addEventListener('click', async () => {
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
            alert('评论提交成功！');
            // 提交成功后可以考虑跳转回主页或者刷新主页评论
            window.location.href = 'index.html'; 
        } catch (error) {
            console.error('提交评论失败:', error);
            alert('提交评论失败');
        }
    });
});