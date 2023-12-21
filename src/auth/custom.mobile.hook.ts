export const useCustomMobileNumber = (mobile: string) => {
  if (!mobile) {
    return { mobileWithIndex: null, mobileWithOutIndex: null };
  }
  const mobileWithIndex = mobile.includes('+995') ? mobile : `+995${mobile}`;
  const mobileWithOutIndex = mobile.includes('+995')
    ? mobile.split('+995')[1]
    : mobile;

  return { mobileWithIndex, mobileWithOutIndex };
};
