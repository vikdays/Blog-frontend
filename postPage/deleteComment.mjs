export function deleteComment(commentElement, commentId) {
    const deleteButton = commentElement.querySelector(".delete");
    deleteButton.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        try {
            await fetchDeleteComment(commentId, token);
            window.location.reload();
        } catch (error) {
            console.error(error.message);
        }
    });
}

async function fetchDeleteComment(commentId, token) {
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/comment/${commentId}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json',
            },
        });
        return true;

    } catch (error) {
        console.error(error.message);
        return false;
    }
}
