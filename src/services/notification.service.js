const sendWelcomeEmail = async ({ email, username }) => {
  if (!email) return;
  console.log(`[notification] Welcome email sent to ${email} for ${username}`);
};

module.exports = {
  sendWelcomeEmail,
};
