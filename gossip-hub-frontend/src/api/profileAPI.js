import API from "./axios";


export const getUserDetails = () => API.get("/profile/getUserDetails");

// Updates Bio, Gender, DOB, username, etc.
export const updateProfile = (data) => API.put("/profile/updateProfile", data);

// Permanent Account Deletion (Purge)
export const deleteAccount = () => API.delete("/profile/deleteProfile");



export const updateDisplayPicture = (formData) => 
    API.put("/profile/updateDisplayPicture", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });


export const deleteDisplayPicture = () => API.delete("/profile/deleteDisplayPicture");

