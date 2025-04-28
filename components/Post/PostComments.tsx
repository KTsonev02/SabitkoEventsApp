import { useEffect, useState } from "react";
import { Text, View, TextInput, Button, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

type Comment = {
    id: number;
    content: string;
    created_on: string;
    username: string;
};

type PostCommentsProps = {
    postId: number;
    userId: string;
    currentUserUsername?: string;
    initialCommentCount?: number;
};

const PostComments = ({ postId, userId, currentUserUsername, initialCommentCount = 0 }: PostCommentsProps) => {
    const [commentContent, setCommentContent] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(initialCommentCount);
    const { user } = useContext(AuthContext);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_HOST_URL}/post?id=${postId}`);
            
            if (!response.ok) {
                throw new Error("Failed to load comments");
            }

            const data = await response.json();
            if (data[0]?.comments) {
                setComments(data[0].comments);
                setCommentCount(data[0].comments.length);
            }
        } catch (error) {
            console.error("Error loading comments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!commentContent.trim()) return;

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_HOST_URL}/post?id=${postId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "add_comment",
                    postId,
                    email: user?.email,
                    content: commentContent,
                    username: currentUserUsername,
                }),
            });

            const textResponse = await response.text();
            let data;

            try {
                data = JSON.parse(textResponse);
            } catch {
                throw new Error(`Server error: ${textResponse}`);
            }

            if (!response.ok) {
                throw new Error(data.error || "Error adding comment");
            }

            setCommentContent("");
            setCommentCount(prev => prev + 1);
            fetchComments();
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    useEffect(() => {
        // Винаги зареждаме броя на коментарите при mount
        fetchComments();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.commentHeader}>
                <View style={styles.commentCountContainer}>
                    <FontAwesome5 name="comment" size={16} color="#555" />
                    <Text style={styles.commentCountText}>{commentCount}</Text>
                </View>
                
                <TouchableOpacity
                    onPress={() => setShowComments(!showComments)}
                    style={styles.toggleButton}
                >
                    <Text style={styles.toggleButtonText}>
                        {showComments ? "Hide Comments" : "Show Comments"}
                    </Text>
                    <FontAwesome
                        name={showComments ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#555"
                    />
                </TouchableOpacity>
            </View>

            {showComments && (
                <>
                    <FlatList
                        data={comments}
                        renderItem={({ item }) => (
                            <View style={styles.comment}>
                                <Text style={styles.commentUsername}>
                                    {item.username || "Anonymous"}
                                </Text>
                                <Text style={styles.commentContent}>{item.content}</Text>
                                <Text style={styles.commentDate}>
                                    {new Date(item.created_on).toLocaleString()}
                                </Text>
                            </View>
                        )}
                        keyExtractor={(item) => item.id.toString()}
                        style={styles.commentsContainer}
                        ListEmptyComponent={
                            <Text>{isLoading ? "Loading..." : "No comments yet."}</Text>
                        }
                    />

                    <View style={styles.commentInputContainer}>
                        <TextInput
                            style={styles.commentInput}
                            value={commentContent}
                            onChangeText={setCommentContent}
                            placeholder="Add a comment..."
                            multiline
                        />
                        <Button
                            title="Add Comment"
                            onPress={handleSubmit}
                            disabled={!commentContent.trim()}
                        />
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
    },
    commentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
    },
    commentCountContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    commentCountText: {
        fontSize: 14,
        fontWeight: "500",
    },
    toggleButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    toggleButtonText: {
        fontWeight: "500",
        color: "#555",
    },
    commentsContainer: {
        marginBottom: 10,
    },
    comment: {
        backgroundColor: "#f5f5f5",
        padding: 10,
        borderRadius: 5,
        marginBottom: 5,
    },
    commentUsername: {
        fontWeight: "bold",
        marginBottom: 3,
    },
    commentContent: {
        marginBottom: 3,
    },
    commentDate: {
        fontSize: 12,
        color: "#666",
    },
    commentInputContainer: {
        marginTop: 10,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
});

export default PostComments;