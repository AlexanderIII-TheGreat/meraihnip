export const jsonToFormData = (json: any) => {
  const formData = new FormData();
  Object.keys(json).forEach((key) => {
    if (json[key]) {
      if (Array.isArray(json[key])) {
        json[key].forEach((item: any) => {
          formData.append(key, item);
        });
      } else if (json[key] instanceof FileList) {
        formData.append(key, json[key][0]);
      } else {
        formData.append(key, json[key]);
      }
    }
  });
  return formData;
};
