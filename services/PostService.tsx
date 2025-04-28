import axios from 'axios';

// Fetch comments for a post
export const getComments = async (postId: number) => {
  try {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_HOST_URL}/post?id=${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

// Add a new comment to a post
export const addComment = async (postId: number, email: string, content: string) => {
  try {
    await axios.post(`${process.env.EXPO_PUBLIC_HOST_URL}/post`, {
      postId,
      email,
      content,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};
