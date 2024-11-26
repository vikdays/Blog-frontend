import { fetchPost } from './postPage.mjs';
export async function getAddressId(postId, token = null) {
    const response =  await fetchPost(postId, token);
    console.log('address', response.addressId);
    return response.addressId;
}

export async function fetchAddress(addressId) {
    const baseUrl = "https://blog.kreosoft.space/api/address/chain";
    const params = new URLSearchParams();
    params.append("objectGuid", addressId || null);
    const url = `${baseUrl}?${params.toString()}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Ошибка загрузки постов");
        const addressData = await response.json();
        const addressString = addressData.map(a => a.text).join(', ');
        return addressString
    } catch (error) {
        console.error("Ошибка при запросе постов:", error.message);
        return ' ';
    }
}