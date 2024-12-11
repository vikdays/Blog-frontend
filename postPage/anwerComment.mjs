import { postComment } from './comments.mjs';

export function answerButtonClick(commentElement, parentId) {
    const existingAnswerForm = commentElement.querySelector(".answer-form");

    if (existingAnswerForm) {
        existingAnswerForm.remove();
        return;
    }
    const answerForm = document.createElement("div");
    answerForm.classList.add("answer-form");

    const answer = document.createElement('input');
    answer.classList.add("answer-input");
    answer.type = 'text';
    answer.placeholder = "Оставьте комментарий...";

    const send = document.createElement("button");
    send.classList.add('send');
    send.textContent = "Отправить";

    answerForm.appendChild(answer);
    answerForm.appendChild(send);
    commentElement.appendChild(answerForm);

    const sendButton = answerForm.querySelector(".send");
    const answerInput = answerForm.querySelector(".answer-input");

    sendButton.addEventListener("click", async () => {
        const content = answerInput.value.trim();
        if (!content) {
            alert("Комментарий не может быть пустым!");
            return;
        }

        const token = localStorage.getItem("token");
        const postId = localStorage.getItem("postId");
        const data = { content, parentId };

        try {
            if (token) {
                await postComment(data, postId, token);
                window.location.reload();
            }
            else{
                alert('Отвечать на комментарии могут писать только авторизованные пользователи');
            }
        } catch (error) {
            console.error("Ошибка при отправке комментария:", error.message);
        }
    });
}
