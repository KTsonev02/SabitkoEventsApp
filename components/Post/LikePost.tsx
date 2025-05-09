export async function likePost(postId: number, email: string) {
  const response = await fetch(`${process.env.EXPO_PUBLIC_HOST_URL}/post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      action: "like", 
      postId,
      email  // Make sure to include email
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to like post");
  }
}

export async function unlikePost(postId: number, email: string) {
  const response = await fetch(`${process.env.EXPO_PUBLIC_HOST_URL}/post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "unlike",
      postId,
      email  // Make sure to include email
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to unlike post");
  }
}