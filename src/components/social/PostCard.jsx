import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AnimatedIcon from '../AnimatedIcon';
import StudioPanel from '../StudioPanel';
import { Like, Comment, Notification, Track, SavedPost, Post } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import ActionButton from '../ActionButton';

const AttachedTrack = ({ track }) => {
    return (
        <div className="mt-3 flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <img src={track.cover_art_url} alt={track.title} className="w-16 h-16 rounded-md object-cover" />
            <div className="flex-1">
                <p className="font-semibold text-slate-900">{track.title}</p>
                <p className="text-sm text-slate-600">{track.artist_name}</p>
            </div>
            <Button size="icon" variant="ghost">
                <Play className="h-5 w-5" />
            </Button>
        </div>
    )
}

const QuotedPost = ({ originalPost }) => {
    if (!originalPost) return null;

    const getInitials = (name) => {
        if (!name) return "?";
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0][0];
    };
    
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="mt-3 border border-slate-200 rounded-xl p-3 space-y-3">
            <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                    <AvatarImage src={originalPost.author_avatar_url} />
                    <AvatarFallback className="text-xs">{getInitials(originalPost.author_name)}</AvatarFallback>
                </Avatar>
                <Link to={createPageUrl(`Artist?id=${originalPost.author_id}`)} className="font-semibold text-sm text-slate-800 hover:underline">
                    {originalPost.author_name}
                </Link>
                <span className="text-xs text-slate-500">• {formatTimeAgo(originalPost.created_date)}</span>
            </div>
            {originalPost.content && <p className="text-sm text-slate-700 whitespace-pre-wrap">{originalPost.content}</p>}
            {originalPost.image_url && <img src={originalPost.image_url} alt="Original post content" className="rounded-lg w-full h-auto max-h-64 object-cover" />}
        </div>
    )
}

export default function PostCard({ post, currentUser }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [likeRecord, setLikeRecord] = useState(null);
  const [shareCount, setShareCount] = useState(post.shares || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [savedRecord, setSavedRecord] = useState(null);
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [repostComment, setRepostComment] = useState("");
  
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [attachedTrack, setAttachedTrack] = useState(null);
  
  const [isCheckingLike, setIsCheckingLike] = useState(true);
  const [isCheckingSave, setIsCheckingSave] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);

  const checkIfLiked = useCallback(async () => {
    if (!currentUser) {
        setIsCheckingLike(false);
        return;
    }
    setIsCheckingLike(true);
    try {
      const likeCheck = await Like.filter({
        user_id: currentUser.id,
        target_id: post.id,
        target_type: 'post'
      });
      
      if (likeCheck.length > 0) {
        setIsLiked(true);
        setLikeRecord(likeCheck[0]);
      }
    } catch (error) {
      console.error("Error checking like status:", error);
    } finally {
      setIsCheckingLike(false);
    }
  }, [currentUser, post.id]);

  const checkIfSaved = useCallback(async () => {
    if (!currentUser) {
        setIsCheckingSave(false);
        return;
    }
    setIsCheckingSave(true);
    try {
        const saved = await SavedPost.filter({ user_id: currentUser.id, post_id: post.id });
        if (saved.length > 0) {
            setIsSaved(true);
            setSavedRecord(saved[0]);
        }
    } catch (error) {
        console.error("Error checking save status:", error);
    } finally {
        setIsCheckingSave(false);
    }
  }, [currentUser, post.id]);

  useEffect(() => {
    let mounted = true;
    
    const initializeStatus = async () => {
      if (mounted && currentUser) {
        await checkIfLiked();
        await checkIfSaved();
      } else {
        setIsCheckingLike(false);
        setIsCheckingSave(false);
      }
    };
    
    initializeStatus();
    
    return () => {
      mounted = false;
    };
  }, [currentUser, post.id, checkIfLiked, checkIfSaved]);

  const loadComments = useCallback(async () => {
    if (isLoadingComments) return;
    
    setIsLoadingComments(true);
    try {
      const postComments = await Comment.filter({ post_id: post.id }, "-created_date", 10);
      setComments(postComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [post.id, isLoadingComments]);

  const loadTrack = useCallback(async () => {
    if (!post.track_id || isLoadingTrack || attachedTrack) return;
    
    setIsLoadingTrack(true);
    try {
      const trackData = await Track.get(post.track_id);
      setAttachedTrack(trackData);
    } catch (error) {
      console.error("Failed to load attached track", error);
    } finally {
      setIsLoadingTrack(false);
    }
  }, [post.track_id, isLoadingTrack, attachedTrack]);

  useEffect(() => {
    if (post.track_id) {
      loadTrack();
    }
  }, [post.track_id, loadTrack]);

  const handleLikeToggle = async () => {
    if (!currentUser) return;
    
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? likeCount - 1 : likeCount + 1);
    
    try {
      if (wasLiked && likeRecord) {
        await Like.delete(likeRecord.id);
        setLikeRecord(null);
      } else if (!wasLiked) {
        const newLike = await Like.create({
          user_id: currentUser.id,
          target_id: post.id,
          target_type: 'post'
        });
        setLikeRecord(newLike);

        if (currentUser.id !== post.author_id) {
          try {
            await Notification.create({
              user_id: post.author_id,
              type: 'like',
              message: `liked your post.`,
              from_user_id: currentUser.id,
              from_user_name: currentUser.artist_name || currentUser.full_name,
              from_user_avatar: currentUser.profile_image_url,
              target_id: post.id,
              action_url: createPageUrl(`Artist?id=${currentUser.id}`)
            });
          } catch (notifError) {
            console.error("Error creating notification:", notifError);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(wasLiked);
      setLikeCount(wasLiked ? likeCount + 1 : likeCount - 1);
    }
  };

  const handleRepost = async () => {
    const originalShareCount = shareCount;
    setShareCount(prev => prev + 1);

    try {
      await Post.create({
        author_id: currentUser.id,
        author_name: currentUser.artist_name || currentUser.full_name,
        author_avatar_url: currentUser.profile_image_url,
        content: repostComment,
        repost_of_data: {
          id: post.id,
          author_id: post.author_id,
          author_name: post.author_name,
          author_avatar_url: post.author_avatar_url,
          content: post.content,
          image_url: post.image_url,
          created_date: post.created_date,
        },
      });
      await Post.update(post.id, { shares: (post.shares || 0) + 1 });
      toast.success("Successfully reposted!");
      setIsRepostModalOpen(false);
      setRepostComment("");
    } catch (error) {
      setShareCount(originalShareCount); // Revert on error
      console.error("Error reposting:", error);
      toast.error("Could not repost.");
    }
  };

  const handleSaveToggle = async () => {
    if (!currentUser) return;

    const wasSaved = isSaved;
    setIsSaved(!wasSaved);

    try {
        if (wasSaved && savedRecord) {
            await SavedPost.delete(savedRecord.id);
            setSavedRecord(null);
            toast.success("Post unsaved!");
        } else if (!wasSaved) {
            const newSave = await SavedPost.create({
                user_id: currentUser.id,
                post_id: post.id,
            });
            setSavedRecord(newSave);
            toast.success("Post saved!");
        }
    } catch (error) {
        console.error("Error toggling save:", error);
        setIsSaved(wasSaved);
        toast.error("Could not save/unsave post.");
    }
  };
  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    try {
      const createdComment = await Comment.create({
        post_id: post.id,
        author_id: currentUser.id,
        author_name: currentUser.artist_name || currentUser.full_name,
        author_avatar_url: currentUser.profile_image_url,
        content: newComment.trim()
      });
      
      setComments(prev => [createdComment, ...prev]);
      setCommentCount(prev => prev + 1);
      setNewComment('');

      if (currentUser.id !== post.author_id) {
        try {
          await Notification.create({
            user_id: post.author_id,
            type: 'comment',
            message: `commented: "${newComment.trim()}"`,
            from_user_id: currentUser.id,
            from_user_name: currentUser.artist_name || currentUser.full_name,
            from_user_avatar: currentUser.profile_image_url,
            target_id: post.id,
            action_url: createPageUrl(`Post?id=${post.id}`)
          });
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Failed to submit comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };
  
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0][0];
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postTime = new Date(dateString);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return postTime.toLocaleDateString();
  };
  
  return (
    <>
    <StudioPanel className="p-0 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl(`Artist?id=${post.author_id}`)}>
            <Avatar className="w-10 h-10 md:w-12 md:h-12">
              <AvatarImage src={post.author_avatar_url} />
              <AvatarFallback className="bg-purple-100 text-purple-700">
                {getInitials(post.author_name)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link 
              to={createPageUrl(`Artist?id=${post.author_id}`)} 
              className="font-semibold text-slate-900 hover:text-purple-600 text-sm md:text-base"
            >
              {post.author_name}
            </Link>
            <p className="text-xs text-slate-500">{formatTimeAgo(post.created_date)}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <AnimatedIcon icon="more" size={16} />
        </Button>
      </div>
      
      {/* Post Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-slate-800 whitespace-pre-wrap text-sm md:text-base">{post.content}</p>
        </div>
      )}

      {/* Quoted Post */}
      {post.repost_of_data && (
          <div className="px-4 pb-3">
            <QuotedPost originalPost={post.repost_of_data} />
          </div>
      )}
      
      {/* Attached Track */}
      {attachedTrack && (
          <div className="px-4 pb-3">
            <AttachedTrack track={attachedTrack} />
          </div>
      )}

      {/* Post Image */}
      {post.image_url && !post.repost_of_data && (
        <div className="bg-slate-100">
          <img 
            src={post.image_url} 
            alt="Post content" 
            className="w-full h-auto max-h-[60vh] md:max-h-[70vh] object-contain"
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLikeToggle}
              className="flex items-center gap-2 text-slate-600 hover:text-red-500 transition-colors disabled:opacity-50"
              disabled={isCheckingLike || !currentUser}
            >
              <AnimatedIcon 
                icon="heart" 
                size={20} 
                className={`${isLiked ? "text-red-500 fill-current" : ""} md:w-6 md:h-6`} 
              />
              <span className="text-sm md:text-base font-medium">{likeCount}</span>
            </button>
            
            <button 
              onClick={toggleComments}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-500 transition-colors disabled:opacity-50"
              disabled={isLoadingComments}
            >
              <AnimatedIcon icon="message" size={20} className="md:w-6 md:h-6" />
              <span className="text-sm md:text-base font-medium">{commentCount}</span>
            </button>
            
            <button 
                onClick={() => setIsRepostModalOpen(true)}
                className="flex items-center gap-2 text-slate-600 hover:text-green-500 transition-colors"
            >
              <AnimatedIcon icon="share" size={20} className="md:w-6 md:h-6" />
              <span className="text-sm md:text-base font-medium">{shareCount}</span>
            </button>
          </div>
          
          <button 
            onClick={handleSaveToggle}
            className="text-slate-600 hover:text-purple-500 transition-colors disabled:opacity-50"
            disabled={isCheckingSave || !currentUser}
          >
            <AnimatedIcon 
                icon="save" 
                size={20} 
                className={`${isSaved ? "text-purple-500 fill-current" : ""} md:w-6 md:h-6`} 
            />
          </button>
        </div>
        
        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {currentUser && (
              <form onSubmit={handleCommentSubmit} className="flex items-start gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={currentUser?.profile_image_url} />
                  <AvatarFallback className="bg-purple-100 text-purple-700 text-sm">
                    {getInitials(currentUser?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[40px] resize-none flex-1 rounded-full px-4 py-2 border-slate-200 text-sm"
                    rows={1}
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="h-10"
                  >
                    {isSubmittingComment ? (
                      <AnimatedIcon icon="loading" size={16} trigger="spin" />
                    ) : (
                      <AnimatedIcon icon="send" size={16} />
                    )}
                  </Button>
                </div>
              </form>
            )}
            
            {isLoadingComments ? (
              <div className="flex justify-center py-4">
                <AnimatedIcon icon="loading" size={20} trigger="spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map(comment => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={comment.author_avatar_url} />
                      <AvatarFallback className="bg-slate-100 text-slate-700 text-sm">
                        {getInitials(comment.author_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800 text-sm">{comment.author_name}</span>
                        <span className="text-xs text-slate-500">{formatTimeAgo(comment.created_date)}</span>
                      </div>
                      <p className="text-slate-700 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && !isLoadingComments && (
                  <p className="text-center text-slate-500 text-sm py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </StudioPanel>
    <Dialog open={isRepostModalOpen} onOpenChange={setIsRepostModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Repost</DialogTitle>
                <DialogDescription>Add a comment to share this post with your followers.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <Textarea
                    placeholder="Add your comment..."
                    value={repostComment}
                    onChange={(e) => setRepostComment(e.target.value)}
                    className="h-24"
                />
                <QuotedPost originalPost={post} />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsRepostModalOpen(false)}>Cancel</Button>
                <ActionButton onClick={handleRepost} icon="share">
                    Repost
                </ActionButton>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}