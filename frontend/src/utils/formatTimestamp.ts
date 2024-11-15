export const formatTimestamp = (timestamp: number, showTime: boolean = false): string => {
  const messageDate = new Date(timestamp * 1000); // Assuming timestamp is in seconds
  const now = new Date();

  const isToday =
    messageDate.getDate() === now.getDate() &&
    messageDate.getMonth() === now.getMonth() &&
    messageDate.getFullYear() === now.getFullYear();

  if (isToday) {
    // Return time in 24-hour format without AM/PM
    return messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } else {
    // Return date in dd/mm/yy format
    const day = String(messageDate.getDate()).padStart(2, '0');
    const month = String(messageDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = String(messageDate.getFullYear()).slice(-2);
    let formattedDate = `${day}/${month}/${year}`;

    if (showTime) {
      // Append time in 24-hour format
      const time = messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      formattedDate += ` ${time}`;
    }

    return formattedDate;
  }
};