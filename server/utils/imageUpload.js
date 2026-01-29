const cloudinary = require('cloudinary').v2;

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    const options = { 
        folder,
        resource_type: "auto", // Allows audio/video/images
        // Removed 'authenticated' types to ensure the <img src={url}> works immediately
    };

    if (height) options.height = height;
    if (quality) options.quality = quality;

    // Use tempFilePath from express-fileupload
    return await cloudinary.uploader.upload(file.tempFilePath, options);
};