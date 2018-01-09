export const http={
   methods:{
     apiPost(url, data){
       return new Promise((resolve, reject) => {
         axios.post(url, data).then((response) => {
           resolve(response)
         }).catch((response) => {
           reject(response)
         })
       });
     }
   }
};

export default http;
