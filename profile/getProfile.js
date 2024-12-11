const token = localStorage.getItem('token');

if (token) {
    fetch('https://blog.kreosoft.space/api/account/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            console.error(`Ошибка авторизации: Статус ${response.status}`);
            alert('Время сессии истекло. Авторизуйтесь заново.');
            window.location.href = '../authorization/authorization.html';
        }
        return response.json();
    })
    .then(data => {
        console.log('Профиль успешно получен:', data);
    })
    .catch(error => {
        console.error('Ошибка при выполнении запроса:', error.message);
        alert('Время сессии истекло. Авторизуйтесь заново.');
        window.location.href = '../authorization/authorization.html';
    });
} 