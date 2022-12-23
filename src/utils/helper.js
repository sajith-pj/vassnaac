export const getToken = () =>{
    return localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') :''
}