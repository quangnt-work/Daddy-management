export const getSeasonInfo = (dateInput?: string | Date) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const month = d.getMonth() + 1; // 1 to 12
  const year = d.getFullYear();
  
  const isPreSeason = month === 6 || month === 7;
  
  let seasonBadgeText = '';
  let titleText = '';
  let seasonValue = '';
  
  if (isPreSeason) {
    seasonBadgeText = `Giao Hữu Hè ${year}`;
    titleText = `🔥 Chiến Dịch Giao Hữu Hè ${year}`;
    seasonValue = `Giao Hữu Hè ${year}`;
  } else {
    if (month >= 8) {
      const nextYear = year + 1;
      seasonBadgeText = `Mùa giải ${year}/${nextYear.toString().slice(-2)}`;
      titleText = `🏆 Mùa Giải Chính Thức ${year}/${nextYear.toString().slice(-2)}`;
      seasonValue = `${year}/${nextYear.toString().slice(-2)}`;
    } else {
      const prevYear = year - 1;
      seasonBadgeText = `Mùa giải ${prevYear}/${year.toString().slice(-2)}`;
      titleText = `🏆 Mùa Giải Chính Thức ${prevYear}/${year.toString().slice(-2)}`;
      seasonValue = `${prevYear}/${year.toString().slice(-2)}`;
    }
  }

  return { isPreSeason, seasonBadgeText, titleText, seasonValue };
};
