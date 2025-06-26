const alertColors = (isDarkMode) => ({
  success: {
    color: isDarkMode ? 'rgb(200, 255, 200)' : 'rgb(30, 70, 32)',
    borderColor: isDarkMode ? 'rgb(76, 175, 80)' : 'rgb(56, 142, 60)',
    bgcolor: isDarkMode ? 'rgba(50, 100, 50, 1)' : 'rgb(237, 247, 237)',
    iconColor: isDarkMode ? 'rgb(100, 200, 100)' : 'rgb(46, 125, 50)',
  },
  info: {
    color: isDarkMode ? 'rgb(180, 220, 255)' : 'rgb(1, 67, 97)',
    borderColor: isDarkMode ? 'rgb(30, 144, 255)' : 'rgb(1, 87, 155)',
    bgcolor: isDarkMode ? 'rgba(20, 50, 80, 1)' : 'rgb(229, 246, 253)',
    iconColor: isDarkMode ? 'rgb(50, 150, 255)' : 'rgb(2, 136, 209)',
  },
  warning: {
    color: isDarkMode ? 'rgb(255, 223, 128)' : 'rgb(102, 60, 0)',
    borderColor: isDarkMode ? 'rgb(255, 152, 0)' : 'rgb(245, 124, 0)',
    bgcolor: isDarkMode ? 'rgba(102, 73, 0, 1)' : 'rgb(255, 244, 229)',
    iconColor: isDarkMode ? 'rgb(255, 200, 100)' : 'rgb(237, 108, 2)',
  },
  error: {
    color: isDarkMode ? 'rgb(255, 180, 180)' : 'rgb(95, 33, 32)',
    borderColor: isDarkMode ? 'rgb(244, 67, 54)' : 'rgb(211, 47, 47)',
    bgcolor: isDarkMode ? 'rgba(60, 20, 20, 1)' : 'rgb(253, 236, 234)',
    iconColor: isDarkMode ? 'rgb(255, 100, 100)' : 'rgb(211, 47, 47)',
  },
});

export default alertColors;
