const select = document.getElementById('size');
for (let i = 5; i <= 100; i += 5) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    select.appendChild(option);
}