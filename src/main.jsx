import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Home, Compass, Users, MessageCircle, Bell, Bookmark, Settings, Plus, Search, Heart, MessageSquare, Repeat2, Send, Sparkles, Image as ImageIcon, Smile, Menu, X, ArrowRight, TrendingUp, MoreHorizontal, UserRound, ShieldCheck, SlidersHorizontal, Hash, Mail, Lock, Eye, EyeOff, ChevronRight, Check, Paperclip, SmilePlus, BarChart3, Megaphone, WandSparkles, CircleHelp, LogOut, Globe2, Moon, Shield, Trash2, Archive, Ban, Camera, Pencil, Share2, Flame, Clock, UserPlus, FileText, Bot, ArrowUpRight } from "lucide-react";
import "./index.css";

const API_BASE = "https://gist-up-api.onrender.com";

const seedPosts = [
  { id: 1, name: "Maya Johnson", handle: "@mayaj", time: "18 min ago", initials: "MJ", tone: "lavender", text: "Small reminder: your progress doesn't have to look like anyone else's. Keep showing up for the things that matter to you. 💜", likes: 128, comments: 24, topic: "Lifestyle" },
  { id: 2, name: "Daniel Okafor", handle: "@dancreates", time: "42 min ago", initials: "DO", tone: "peach", text: "Working on a new creative project this week. What's one thing you're learning right now?", likes: 86, comments: 17, topic: "Creators" },
  { id: 3, name: "Aisha Bello", handle: "@aishab", time: "1 hr ago", initials: "AB", tone: "mint", text: "Today's little win: I finally finished the book that has been sitting on my desk for months. What are you celebrating today?", likes: 204, comments: 31, topic: "Community" }
];

const navigation = [
  { label: "Home", icon: Home }, { label: "Explore", icon: Compass }, { label: "Communities", icon: Users },
  { label: "Messages", icon: MessageCircle }, { label: "Notifications", icon: Bell }, { label: "Saved", icon: Bookmark }
];
const spaces = [
  { name: "Creator Studio", icon: Sparkles, desc: "Create and understand your content." },
  { name: "AI Assistant", icon: Bot, desc: "Brainstorm ideas and polish your writing." },
  { name: "Ads Manager", icon: Megaphone, desc: "Plan and review promotional campaigns." },
  { name: "Settings & Privacy", icon: Settings, desc: "Manage your account and preferences." }
];
function Avatar({ initials, tone = "lavender", size = "" }) { return <div className={"avatar " + tone + " " + size}>{initials}</div>; }
function App() {
  const [active, setActive] = useState("Home");
  const [liked, setLiked] = useState([]);
  const [saved, setSaved] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("Reach");
  const [campaignBudget, setCampaignBudget] = useState("1000");
  const [campaignAudience, setCampaignAudience] = useState("");
  const [campaignBusy, setCampaignBusy] = useState(false);
  const [following, setFollowing] = useState([]);
  const [people, setPeople] = useState([]);
  const [feedMode, setFeedMode] = useState("for-you");
  const [followerCount, setFollowerCount] = useState(0);
  const [posts, setPosts] = useState([]);
  const [postBusy, setPostBusy] = useState(false);
  const [postText, setPostText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentPost, setCommentPost] = useState(null);
  const [reportPost, setReportPost] = useState(null);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [postComments, setPostComments] = useState([]);
  const [commentsBusy, setCommentsBusy] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [messageUserResults, setMessageUserResults] = useState([]);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [messageBusy, setMessageBusy] = useState(false);
  const [settingsTab, setSettingsTab] = useState("Account");
  const [authMode, setAuthMode] = useState("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileTab, setProfileTab] = useState("Posts");
  const [notificationFilter, setNotificationFilter] = useState("All");
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [assistantReply, setAssistantReply] = useState("");
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [communityJoined, setCommunityJoined] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [profileBio, setProfileBio] = useState("Your story starts here. Add a bio and let people get to know you.");
  const [editProfile, setEditProfile] = useState(false);
  const [displayName, setDisplayName] = useState("Your profile");
  const [handle, setHandle] = useState("@yourprofile");
  const [darkMode, setDarkMode] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authUser, setAuthUser] = useState(null);

  async function loadAppData(fallbackUser = null) {
    try {
      const [profileResponse, postsResponse, usersResponse, followingResponse, blocksResponse, savedResponse, notificationsResponse, campaignsResponse] = await Promise.all([
        fetch(API_BASE + "/api/profile/me", { credentials: "include" }),
        fetch(API_BASE + "/api/posts?feed=" + encodeURIComponent(feedMode), { credentials: "include" }),
        fetch(API_BASE + "/api/users", { credentials: "include" }),
        fetch(API_BASE + "/api/follows/me", { credentials: "include" }),
        fetch(API_BASE + "/api/blocks/me", { credentials: "include" }),
        fetch(API_BASE + "/api/saved", { credentials: "include" }),
        fetch(API_BASE + "/api/notifications", { credentials: "include" }),
        fetch(API_BASE + "/api/ads/campaigns", { credentials: "include" })
      ]);
      let user = fallbackUser;
      if (profileResponse.ok) {
        const data = await profileResponse.json();
        user = data.profile || user;
        setFollowerCount(Number(data.followersCount || 0));
      }
      if (user) {
        setAuthUser(user);
        setDisplayName(user.full_name || user.email?.split("@")[0] || "Your profile");
        setHandle("@" + (user.username || user.email?.split("@")[0] || "member"));
        setProfileBio(user.bio || "");
      }
      if (usersResponse.ok) {
        const userData = await usersResponse.json().catch(() => ({}));
        const mapped = (Array.isArray(userData.users) ? userData.users : []).map((person, index) => ({
          id: person.id,
          name: person.full_name,
          handle: "@" + person.username,
          initials: String(person.full_name || person.username).split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(),
          tone: ["lavender", "mint", "peach"][index % 3],
          bio: person.bio || "Getting started on Gist Up.",
          isFollowing: person.is_following === true,
          followersCount: Number(person.followers_count || 0)
        }));
        setPeople(mapped);
        setFollowing(mapped.filter(person => person.isFollowing).map(person => person.handle));
      }
      if (followingResponse.ok) {
        const followingData = await followingResponse.json().catch(() => ({}));
        const handles = (Array.isArray(followingData.users) ? followingData.users : []).map(person => "@" + person.username);
        setFollowing(handles);
      }
      if (blocksResponse.ok) {
        const blocksData = await blocksResponse.json().catch(() => ({}));
        const mappedBlocks = (Array.isArray(blocksData.users) ? blocksData.users : []).map((person, index) => ({
          id: person.id, name: person.full_name, handle: "@" + person.username,
          initials: String(person.full_name || person.username).split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(),
          tone: ["lavender", "mint", "peach"][index % 3], bio: person.bio || ""
        }));
        setBlocked(mappedBlocks);
      }
      if (postsResponse.ok) {
        const data = await postsResponse.json();
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setLiked(Array.isArray(data.posts) ? data.posts.filter(post => post.isLiked).map(post => post.id) : []);
      } else if (postsResponse.status !== 401) {
        notify("We couldn't load posts right now.");
      }
      if (savedResponse.ok) {
        const savedData = await savedResponse.json().catch(() => ({}));
        const items = Array.isArray(savedData.posts) ? savedData.posts : [];
        setSavedPosts(items);
        setSaved(items.map(post => post.id));
      }
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json().catch(() => ({}));
        setNotifications(Array.isArray(notificationsData.notifications) ? notificationsData.notifications : []);
      }
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json().catch(() => ({}));
        setCampaigns(Array.isArray(campaignsData.campaigns) ? campaignsData.campaigns : []);
      }
    } catch {
      notify("Couldn't refresh your profile and feed. Please try again.");
    }
  }

  useEffect(() => {
    let mounted = true;
    fetch(API_BASE + "/api/auth/me", { credentials: "include" })
      .then(async response => response.ok ? (await response.json()).user : null)
      .then(async user => {
        if (!mounted || !user) return;
        setAuthUser(user);
        setAuthMode("app");
        await loadAppData(user);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);


  useEffect(() => {
    if (authUser && active === "Messages") loadConversations();
  }, [authUser, active, showArchived]);

  useEffect(() => {
    if (!authUser || active !== "Messages" || !activeConversationId) return;
    loadThread(activeConversationId);
    const timer = window.setInterval(() => loadThread(activeConversationId), 5000);
    return () => window.clearInterval(timer);
  }, [authUser, active, activeConversationId]);

  useEffect(() => {
    if (!showNewMessage) { setMessageUserResults([]); return; }
    const timer = window.setTimeout(() => searchMessageUsers(messageSearch), 250);
    return () => window.clearTimeout(timer);
  }, [showNewMessage, messageSearch]);

  async function submitAuth() {
    setAuthError("");
    if (!email.trim() || !password) { setAuthError("Enter your email address and password."); return; }
    if (authMode === "signup" && !fullName.trim()) { setAuthError("Enter your full name."); return; }
    if (password.length < 8) { setAuthError("Your password must be at least 8 characters."); return; }
    setAuthBusy(true);
    setAuthError("Connecting to Gist Up account service…");
    try {
      const response = await fetch(API_BASE + (authMode === "signup" ? "/api/auth/signup" : "/api/auth/login"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim().toLowerCase(), password })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't complete sign-in. Please try again.");
      const user = result.user;
      if (!user) throw new Error("The account service returned an invalid response. Please try again.");
      setAuthUser(user);
      setDisplayName(user.full_name || user.email?.split("@")[0] || "Your profile");
      setHandle("@" + (user.username || user.email?.split("@")[0] || "member"));
      setAuthMode("app");
      setAuthError("");
      await loadAppData(user);
      notify(authMode === "signup" ? "Welcome to Gist Up! Your account is ready." : "You're logged in.");
    } catch (error) {
      setAuthError(error?.message || "We couldn't complete sign-in. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function signOut() {
    try {
      await fetch(API_BASE + "/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    setAuthUser(null);
    setAuthMode("welcome");
    setPassword("");
    notify("You've signed out.");
  }

  function notify(message) { setNotice(message); window.setTimeout(() => setNotice(""), 2800); }
  async function publish() {
    const content = postText.trim();
    if (!content || postBusy) return;
    setPostBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/posts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't publish your post.");
      if (!result.post) throw new Error("The server didn't return the new post.");
      setPosts(current => [result.post, ...current]);
      setPostText("");
      setComposerOpen(false);
      setActive("Home");
      notify("Your post was published.");
    } catch (error) {
      notify(error?.message || "We couldn't publish your post. Please try again.");
    } finally {
      setPostBusy(false);
    }
  }

  async function saveProfile() {
    const cleanHandle = handle.trim().replace(/^@+/, "");
    try {
      const response = await fetch(API_BASE + "/api/profile/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: displayName, username: cleanHandle, bio: profileBio })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't save your profile.");
      if (!result.profile) throw new Error("The server didn't return the updated profile.");
      setAuthUser(result.profile);
      setDisplayName(result.profile.full_name);
      setHandle("@" + result.profile.username);
      setProfileBio(result.profile.bio || "");
      setEditProfile(false);
      notify("Your profile has been saved.");
    } catch (error) {
      notify(error?.message || "We couldn't save your profile. Please try again.");
    }
  }
  function go(label) { setActive(label); setMobileNav(false); }
  async function toggleLike(post) {
    const currentlyLiked = liked.includes(post.id);
    setLiked(old => currentlyLiked ? old.filter(id => id !== post.id) : [...old, post.id]);
    setPosts(old => old.map(item => item.id === post.id ? { ...item, likes: Math.max(0, (item.likes || 0) + (currentlyLiked ? -1 : 1)) } : item));
    try {
      const response = await fetch(API_BASE + "/api/posts/" + post.id + "/like", { method: "POST", credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't update like.");
      setLiked(old => result.liked ? (old.includes(post.id) ? old : [...old, post.id]) : old.filter(id => id !== post.id));
      setPosts(old => old.map(item => item.id === post.id ? { ...item, likes: result.likes } : item));
    } catch (error) {
      setLiked(old => currentlyLiked ? (old.includes(post.id) ? old : [...old, post.id]) : old.filter(id => id !== post.id));
      setPosts(old => old.map(item => item.id === post.id ? { ...item, likes: Math.max(0, (item.likes || 0) + (currentlyLiked ? 1 : -1)) } : item));
      notify(error?.message || "Couldn't update like. Please try again.");
    }
  }
  async function openComments(postId) {
    setCommentPost(postId);
    setCommentText("");
    setPostComments([]);
    setCommentsBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/posts/" + postId + "/comments", { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't load comments.");
      setPostComments(Array.isArray(result.comments) ? result.comments : []);
    } catch (error) {
      notify(error?.message || "Couldn't load comments.");
    } finally {
      setCommentsBusy(false);
    }
  }
  async function submitComment() {
    const content = commentText.trim();
    if (!content || commentPost === null) return;
    try {
      const response = await fetch(API_BASE + "/api/posts/" + commentPost + "/comments", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't publish comment.");
      setPostComments(old => [...old, result.comment]);
      setPosts(old => old.map(item => item.id === commentPost ? { ...item, comments: (item.comments || 0) + 1 } : item));
      setCommentText("");
      notify("Comment published.");
    } catch (error) {
      notify(error?.message || "Couldn't publish comment.");
    }
  }
  async function toggleFollow(person) {
    if (!person.id) { notify("Only registered accounts can be followed."); return; }
    const wasFollowing = following.includes(person.handle);
    setFollowing(old => wasFollowing ? old.filter(x => x !== person.handle) : [...old, person.handle]);
    setPeople(old => old.map(item => item.id === person.id ? { ...item, isFollowing: !wasFollowing } : item));
    try {
      const response = await fetch(API_BASE + "/api/users/" + person.id + "/follow", { method: "POST", credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't update following.");
      setFollowing(old => result.following ? (old.includes(person.handle) ? old : [...old, person.handle]) : old.filter(x => x !== person.handle));
      setPeople(old => old.map(item => item.id === person.id ? { ...item, isFollowing: result.following, followersCount: result.followersCount } : item));
    } catch (error) {
      setFollowing(old => wasFollowing ? (old.includes(person.handle) ? old : [...old, person.handle]) : old.filter(x => x !== person.handle));
      setPeople(old => old.map(item => item.id === person.id ? { ...item, isFollowing: wasFollowing } : item));
      notify(error?.message || "Couldn't update following.");
    }
  }
  async function askGistyAI() {
    const prompt = assistantPrompt.trim();
    if (!prompt || assistantBusy) return;
    setAssistantBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/ai/chat", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Gisty AI couldn't respond right now.");
      setAssistantReply(result.reply || "");
    } catch (error) {
      notify(error?.message || "Gisty AI couldn't respond right now.");
    } finally {
      setAssistantBusy(false);
    }
  }
  async function createCampaign() {
    const name = campaignName.trim();
    if (name.length < 3) { notify("Give your campaign a name of at least 3 characters."); return; }
    setCampaignBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/ads/campaigns", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, goal: campaignGoal, dailyBudget: Number(campaignBudget), audience: campaignAudience.trim() })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't save this campaign.");
      setCampaigns(old => [result.campaign, ...old]);
      setCampaignName("");
      setCampaignGoal("Reach");
      setCampaignBudget("1000");
      setCampaignAudience("");
      setCampaignModalOpen(false);
      notify("Campaign draft saved.");
    } catch (error) {
      notify(error?.message || "Couldn't save this campaign.");
    } finally {
      setCampaignBusy(false);
    }
  }
  async function submitReport() {
    if (!reportPost || reportBusy) return;
    setReportBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/posts/" + reportPost.id + "/report", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason, details: reportDetails.trim() })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't submit your report.");
      setReportPost(null);
      setReportDetails("");
      notify("Thanks. Your report has been sent for review.");
    } catch (error) {
      notify(error?.message || "Couldn't submit your report.");
    } finally {
      setReportBusy(false);
    }
  }
  async function toggleSave(post) {
    const wasSaved = saved.includes(post.id);
    setSaved(old => wasSaved ? old.filter(id => id !== post.id) : [...old, post.id]);
    setSavedPosts(old => wasSaved ? old.filter(item => item.id !== post.id) : [post, ...old.filter(item => item.id !== post.id)]);
    try {
      const response = await fetch(API_BASE + "/api/posts/" + post.id + "/save", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved: !wasSaved })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't update saved posts.");
      notify(result.saved ? "Post saved." : "Removed from Saved.");
    } catch (error) {
      setSaved(old => wasSaved ? (old.includes(post.id) ? old : [...old, post.id]) : old.filter(id => id !== post.id));
      setSavedPosts(old => wasSaved ? (old.some(item => item.id === post.id) ? old : [post, ...old]) : old.filter(item => item.id !== post.id));
      notify(error?.message || "Couldn't update saved posts.");
    }
  }
  async function toggleBlock(person, shouldBlock) {
    if (!person.id) { notify("Only registered accounts can be blocked."); return; }
    try {
      const response = await fetch(API_BASE + "/api/users/" + person.id + "/block", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: shouldBlock })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't update blocked accounts.");
      if (shouldBlock) {
        setBlocked(old => old.some(item => item.id === person.id) ? old : [...old, person]);
        setPeople(old => old.filter(item => item.id !== person.id));
        setFollowing(old => old.filter(item => item !== person.handle));
        notify(person.name + " has been blocked.");
      } else {
        setBlocked(old => old.filter(item => item.id !== person.id));
        notify(person.name + " has been unblocked.");
      }
    } catch (error) {
      notify(error?.message || "Couldn't update blocked accounts.");
    }
  }
  async function changeFeed(mode) {
    setFeedMode(mode);
    try {
      const response = await fetch(API_BASE + "/api/posts?feed=" + encodeURIComponent(mode), { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't load this feed.");
      const items = Array.isArray(result.posts) ? result.posts : [];
      setPosts(items);
      setLiked(items.filter(post => post.isLiked).map(post => post.id));
    } catch (error) {
      notify(error?.message || "Couldn't load this feed.");
    }
  }
  async function loadConversations(archivedOverride = showArchived, preferredConversationId = null) {
    try {
      const response = await fetch(API_BASE + "/api/conversations?archived=" + String(archivedOverride), { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't load your conversations.");
      const items = Array.isArray(result.conversations) ? result.conversations : [];
      setConversations(items);
      const preferredId = preferredConversationId || activeConversationId;
      if (preferredId && items.some(item => String(item.id) === String(preferredId))) {
        setActiveConversationId(preferredId);
      } else if (preferredId && !items.some(item => String(item.id) === String(preferredId))) {
        setActiveConversationId(items.length ? items[0].id : null);
      } else if (!preferredId && items.length && !archivedOverride) {
        setActiveConversationId(items[0].id);
      }
    } catch (error) {
      notify(error?.message || "We couldn't load your conversations.");
    }
  }

  async function loadThread(conversationId) {
    if (!conversationId) { setThreadMessages([]); return; }
    try {
      const response = await fetch(API_BASE + "/api/conversations/" + encodeURIComponent(conversationId) + "/messages", { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't load this conversation.");
      setThreadMessages(Array.isArray(result.messages) ? result.messages : []);
    } catch (error) {
      notify(error?.message || "We couldn't load this conversation.");
    }
  }

  async function startConversation(user) {
    try {
      const response = await fetch(API_BASE + "/api/conversations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't start that conversation.");
      setShowArchived(false);
      setShowNewMessage(false);
      setMessageSearch("");
      setActiveConversationId(result.conversationId);
      setActive("Messages");
      await loadConversations(false, result.conversationId);
      await loadThread(result.conversationId);
    } catch (error) {
      notify(error?.message || "We couldn't start that conversation.");
    }
  }

  async function sendMessage() {
    const content = messageDraft.trim();
    if (!content || !activeConversationId || messageBusy) return;
    setMessageBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/conversations/" + encodeURIComponent(activeConversationId) + "/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't send that message.");
      setMessageDraft("");
      await Promise.all([loadThread(activeConversationId), loadConversations()]);
    } catch (error) {
      notify(error?.message || "We couldn't send that message.");
    } finally {
      setMessageBusy(false);
    }
  }

  async function searchMessageUsers(value) {
    if (value.trim().length < 2) { setMessageUserResults([]); return; }
    try {
      const response = await fetch(API_BASE + "/api/users?search=" + encodeURIComponent(value.trim()), { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Account search failed.");
      setMessageUserResults(Array.isArray(result.users) ? result.users : []);
    } catch (error) {
      notify(error?.message || "Account search failed.");
    }
  }

  async function toggleConversationArchive(conversationId, archive) {
    try {
      const response = await fetch(API_BASE + "/api/conversations/" + encodeURIComponent(conversationId) + "/archive", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: archive })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't update that conversation.");
      setActiveConversationId(null);
      await loadConversations();
      notify(archive ? "Conversation archived." : "Conversation restored to your inbox.");
    } catch (error) {
      notify(error?.message || "We couldn't update that conversation.");
    }
  }
  const filteredPeople = useMemo(() => people.filter(p => (p.name + " " + p.handle + " " + p.bio).toLowerCase().includes(query.toLowerCase())), [query]);
  const myInitials = displayName.split(/\s+/).map(x => x[0]).join("").slice(0,2).toUpperCase() || "YO";
  const titleCopy = {
    Home: ["Your feed", "Catch up with the people and ideas you care about."],
    Explore: ["Explore", "Find conversations, people and ideas worth your time."],
    Communities: ["Communities", "Find your people around the things you love."],
    Messages: ["Messages", "Keep the conversation going."],
    Notifications: ["Notifications", "The latest from your Gist Up community."],
    Saved: ["Saved posts", "Keep the posts you want to come back to."],
    Profile: ["Your profile", "Your corner of Gist Up, shaped by you."],
    "Creator Studio": ["Creator Studio", "A home for your ideas, posts and creative progress."],
    "AI Assistant": ["AI Assistant", "A thoughtful helper for your next idea."],
    "Ads Manager": ["Ads Manager", "Manage promotional ideas and campaign drafts."],
    "Settings & Privacy": ["Settings & Privacy", "Your account, your choices."]
  };
  function HeaderTitle() {
    const [title, subtitle] = titleCopy[active] || [active, "Make this space yours."];
    return <div className="page-heading"><div><p className="eyebrow">YOUR PEOPLE. YOUR STORIES.</p><h1>{title}</h1><p className="muted">{subtitle}</p></div>{["Home","Profile"].includes(active) && <button className="primary-button" onClick={() => setComposerOpen(true)}><Plus size={18}/> Create post</button>}</div>;
  }
  function PostCard({ post }) {
    const isLiked = liked.includes(post.id);
    return <article className="post-card" key={post.id}>
      <div className="post-header"><Avatar initials={post.initials} tone={post.tone}/><div className="post-author"><strong>{post.name}</strong><span>{post.handle} · {post.time}</span></div><button className="icon-button post-more" aria-label="Post options" onClick={() => { setReportPost(post); setReportReason("Spam"); setReportDetails(""); }}><MoreHorizontal size={21}/></button></div>
      <p className="post-copy">{post.text}</p><div className="post-tag"># {post.topic || "community"}</div>
      <div className="post-stats"><span>{post.likes} likes</span><span>{post.comments} comments</span></div>
      <div className="post-actions"><button className={isLiked ? "liked" : ""} onClick={() => toggleLike(post)}><Heart size={18} fill={isLiked ? "currentColor" : "none"}/> Like</button><button onClick={() => openComments(post.id)}><MessageSquare size={18}/> Comment</button><button onClick={() => notify("Repost preview: this action is not yet connected to a server.")}><Repeat2 size={18}/> Repost</button><button aria-label="Share post" onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(window.location.href).catch(()=>{}); notify("Share link copied when clipboard access is available."); }}><Share2 size={18}/></button><button aria-label="Save post" className={saved.includes(post.id) ? "liked" : ""} onClick={() => toggleSave(post)}><Bookmark size={18} fill={saved.includes(post.id) ? "currentColor" : "none"}/></button></div>
    </article>;
  }
  function HomePage() {
    return <>
      <section className="welcome-banner"><div className="welcome-copy"><span className="welcome-pill"><Sparkles size={13}/> YOUR PEOPLE. YOUR STORIES.</span><h2>A little more connection.<br/><span>A lot more you.</span></h2><p>A place to share your story, discover new perspectives, and find your people.</p><button onClick={() => go("Explore")}>Find your community <ArrowRight size={16}/></button></div><div className="banner-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-card art-card-one"><span>✦</span><b>Good energy</b><small>starts here</small></div><div className="art-card art-card-two"><div className="mini-avatars"><i>M</i><i>D</i><i>A</i></div><b>Find your people</b><small>Make real connections</small></div><div className="art-sparkle">✦</div></div></section>
      <section className="composer-card"><Avatar initials={myInitials} size="medium"/><button className="composer-placeholder" onClick={() => setComposerOpen(true)}>What's on your mind?</button><button className="composer-tool" aria-label="Add photo" onClick={() => setComposerOpen(true)}><ImageIcon size={19}/></button><button className="composer-tool" aria-label="Add feeling" onClick={() => setComposerOpen(true)}><Smile size={19}/></button><button className="composer-post" onClick={() => setComposerOpen(true)}>Post</button></section>
      <div className="feed-tabs"><button className={feedMode==="for-you"?"tab-active":""} onClick={()=>changeFeed("for-you")}>For you</button><button className={feedMode==="following"?"tab-active":""} onClick={()=>changeFeed("following")}>Following</button><button onClick={() => go("Explore")}>Trending</button><span className="feed-sort">Latest <MoreHorizontal size={18}/></span></div>
      {posts.map(post => <PostCard post={post} key={post.id}/>)}
    </>;
  }
  function ExplorePage() {
    const topics = useMemo(() => {
      const counts = new Map();
      posts.forEach(post => {
        const tags = (String(post.text || "").match(/#[a-z0-9_]+/gi) || []);
        tags.forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1));
        if (!tags.length && post.topic) {
          const tag = "#" + String(post.topic).replace(/[^a-z0-9_]/gi, "");
          counts.set(tag, (counts.get(tag) || 0) + 1);
        }
      });
      return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([tag, count]) => [tag, count + (count === 1 ? " post" : " posts"), "Community"]);
    }, [posts]);
    const matchingPosts = posts.filter(post => [post.text, post.name, post.handle, post.topic].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
    return <div className="screen-stack"><div className="search-large"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search people, topics, and communities"/></div><section className="feature-panel explore-feature"><div><span className="welcome-pill"><Flame size={13}/> DISCOVER</span><h2>What's your next conversation?</h2><p>Find registered members and posts from your Gist Up community.</p></div><Compass size={54}/></section><section className="content-panel"><div className="section-title"><h2>People you might like</h2><span>{filteredPeople.length} suggestions</span></div>{filteredPeople.map(p=><div className="person-row" key={p.handle}><Avatar initials={p.initials} tone={p.tone}/><div className="person-copy"><strong>{p.name}</strong><span>{p.handle}</span><p>{p.bio}</p></div><button className={following.includes(p.handle)?"follow-button following":"follow-button"} onClick={()=>toggleFollow(p)}>{following.includes(p.handle)?"Following":"Follow"}</button></div>)}{!filteredPeople.length&&<p className="empty-state">No registered people match this search yet.</p>}</section><section className="content-panel"><div className="section-title"><h2>Topics in your feed</h2><span>From real posts</span></div>{topics.length?<div className="topic-grid">{topics.map(([tag,count,category])=><button className="topic-card" key={tag} onClick={()=>setQuery(tag.replace("#",""))}><span>{category}</span><strong>{tag}</strong><small>{count}</small><ArrowUpRight size={16}/></button>)}</div>:<div className="empty-state-box"><Hash size={24}/><strong>No topics to show yet</strong><p>Topics will appear here as people publish posts with hashtags or topic labels.</p></div>}</section><section className="content-panel"><div className="section-title"><h2>{query.trim()?"Matching posts":"Posts worth a look"}</h2><span>{matchingPosts.length} posts</span></div>{matchingPosts.slice(0,5).map(post=><PostCard post={post} key={post.id}/>)}{!matchingPosts.length&&<p className="empty-state">No posts match this search yet.</p>}</section></div>;
  }
  function CommunitiesPage() {
    const groups=[["Creative Corner","Share your work, get feedback, and meet fellow creatives.","12.8k members","CC","lavender"],["Everyday Wins","A little space to celebrate big and small moments.","8.4k members","EW","mint"],["Design & Digital","Ideas, inspiration and thoughtful design conversations.","6.2k members","DD","peach"],["Book Club","For readers, reviewers and people who love a good story.","4.1k members","BC","lavender"]];
    return <div className="screen-stack"><section className="feature-panel"><div><span className="welcome-pill"><Users size={13}/> FIND YOUR PEOPLE</span><h2>Belong to something good.</h2><p>Join spaces where you can share, learn, and feel at home.</p></div><Users size={54}/></section><div className="section-title"><h2>Communities to explore</h2><button className="outline-button compact" onClick={()=>notify("Community creation will be available after account and server setup.")}><Plus size={15}/> Create community</button></div><div className="community-grid">{groups.map(([name,desc,count,initials,tone])=><article className="community-card" key={name}><div className={"community-art "+tone}><Avatar initials={initials} tone={tone} size="large"/></div><div className="community-card-body"><h3>{name}</h3><p>{desc}</p><span><Users size={14}/> {count}</span><button className={communityJoined.includes(name)?"outline-button":"primary-button"} onClick={()=>setCommunityJoined(old=>old.includes(name)?old.filter(x=>x!==name):[...old,name])}>{communityJoined.includes(name)?<><Check size={15}/> Joined</>:<>Join community <ArrowRight size={15}/></>}</button></div></article>)}</div></div>;
  }
  function MessagesPage() {
    const current = conversations.find(c => String(c.id) === String(activeConversationId));
    const visibleConversations = conversations.filter(c => {
      const text = [c.full_name, c.username, c.last_message || ""].join(" ").toLowerCase();
      return text.includes(messageSearch.toLowerCase());
    });
    const initialsFor = name => String(name || "?").split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
    const formatTime = value => value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
    return <div className="messages-layout">
      <section className="message-list-panel">
        <div className="message-list-head"><h2>Chats</h2><button className={"icon-button "+(showNewMessage?"tab-active":"")} aria-label="New message" onClick={() => { setShowNewMessage(old => !old); setMessageSearch(""); }}><Pencil size={17}/></button></div>
        <div className="search-small"><Search size={16}/><input value={messageSearch} onChange={e => setMessageSearch(e.target.value)} placeholder={showNewMessage ? "Search registered accounts" : "Search conversations"}/></div>
        <div className="message-filters"><button className={!showArchived?"tab-active":""} onClick={() => { setShowArchived(false); setActiveConversationId(null); }}>All</button><button className={showArchived?"tab-active":""} onClick={() => { setShowArchived(true); setActiveConversationId(null); }}>Archived</button></div>
        {showNewMessage ? <div className="message-search-results">
          {messageSearch.trim().length < 2 ? <p className="empty-state">Search by a person's name or username to start a real conversation.</p> : messageUserResults.length ? messageUserResults.map(user => <button className="conversation-row" key={user.id} onClick={() => startConversation(user)}><Avatar initials={initialsFor(user.full_name)}/><span className="conversation-copy"><strong>{user.full_name}</strong><small>@{user.username}</small></span><ArrowRight size={16}/></button>) : <p className="empty-state">No registered accounts found for that search.</p>}
        </div> : visibleConversations.length ? visibleConversations.map(c => <button className={"conversation-row "+(String(activeConversationId)===String(c.id)?"conversation-active":"")} key={c.id} onClick={() => setActiveConversationId(c.id)}><Avatar initials={initialsFor(c.full_name)}/><span className="conversation-copy"><strong>{c.full_name}</strong><small>{c.last_message || "Start the conversation"}</small></span><span className="conversation-meta"><small>{formatTime(c.last_message_at)}</small></span></button>) : <div className="empty-state">No {showArchived ? "archived " : ""}conversations yet. Use the pencil button to message a registered user.</div>}
      </section>
      <section className="chat-panel">
        {current ? <>
          <div className="chat-head"><Avatar initials={initialsFor(current.full_name)}/><div><strong>{current.full_name}</strong><span>@{current.username}</span></div><button className="icon-button" aria-label={showArchived?"Restore conversation":"Archive conversation"} onClick={() => toggleConversationArchive(current.id, !showArchived)}><Archive size={18}/></button></div>
          <div className="chat-history"><div className="chat-date">MESSAGES</div>{threadMessages.length ? threadMessages.map(m => <div className={"chat-message "+(String(m.sender_id)===String(authUser?.id)?"mine":"")} key={m.id}><p>{m.content}</p><small>{formatTime(m.created_at)}</small></div>) : <p className="empty-state">This is the beginning of your conversation. Send a message to get started.</p>}</div>
          {!showArchived && <div className="chat-compose"><input value={messageDraft} onChange={e=>setMessageDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Write a message…" maxLength={4000}/><button className="primary-button send-message" onClick={sendMessage} disabled={!messageDraft.trim()||messageBusy}><Send size={16}/></button></div>}
          <p className="preview-note chat-note">Messages are saved to your Gist Up account. Both people must have registered accounts.</p>
        </> : <div className="empty-panel chat-empty"><div className="placeholder-icon"><MessageCircle size={27}/></div><h2>{showArchived?"Your archived chats":"Your conversations"}</h2><p>Select a chat, or use the pencil button to start a conversation with a registered Gist Up user.</p><button className="primary-button" onClick={() => { setShowArchived(false); setShowNewMessage(true); setMessageSearch(""); }}>New message <Pencil size={15}/></button></div>}
      </section>
    </div>;
  }
  function NotificationsPage() {
    const actionText = { follow: "started following you.", like: "liked your post.", comment: "commented on your post.", message: "sent you a message." };
    const filtered = notifications.filter(item => notificationFilter === "All" || (notificationFilter === "Follows" && item.type === "follow") || (notificationFilter === "Comments" && item.type === "comment"));
    async function markAllRead() {
      try {
        const response = await fetch(API_BASE + "/api/notifications/read-all", { method: "PATCH", credentials: "include" });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Couldn't mark notifications as read.");
        setNotifications(old => old.map(item => ({ ...item, is_read: true })));
        notify("All notifications marked as read.");
      } catch (error) { notify(error?.message || "Couldn't update notifications."); }
    }
    return <div className="content-panel notifications-panel"><div className="notification-tabs">{["All","Comments","Follows"].map(t=><button className={notificationFilter===t?"tab-active":""} onClick={()=>setNotificationFilter(t)} key={t}>{t}</button>)}<button className="text-button mark-read" onClick={markAllRead}>Mark all as read</button></div>{filtered.map((item,index)=>{const name=item.actor_name||"Gist Up member";const initials=String(name).split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase();const time=new Date(item.created_at).toLocaleString();return <div className={"notification-row "+(item.is_read?"notification-read":"")} key={item.id}><Avatar initials={initials} tone={["lavender","mint","peach"][index%3]}/><div><p><strong>{name}</strong> {actionText[item.type]||"interacted with you."}</p><span>{time}</span></div>{!item.is_read&&<i/>}</div>})}{!filtered.length&&<div className="empty-state-box"><Bell size={24}/><strong>No notifications yet</strong><p>New follows, likes, comments, and messages will appear here.</p></div>}</div>;
  }
  function SavedPage() { return <div className="screen-stack">{savedPosts.length?savedPosts.map(post=><PostCard post={post} key={post.id}/>):<div className="empty-panel"><div className="placeholder-icon"><Bookmark size={27}/></div><h2>Your saved posts live here</h2><p>Tap the bookmark on a post to keep it close for later.</p><button className="primary-button" onClick={()=>go("Home")}>Explore your feed <ArrowRight size={16}/></button></div>}</div>; }
  function ProfilePage() {
    const myPosts = posts.filter(p => p.handle === handle);
    const visibleProfilePosts = profileTab === "Likes" ? posts.filter(p => liked.includes(p.id)) : myPosts;
    const emptyTitle = profileTab === "Posts" ? "Your story starts with a post" : profileTab === "Likes" ? "No liked posts yet" : profileTab + " will appear here";
    const emptyCopy = profileTab === "Posts" ? "Share something with your community to get started." : profileTab === "Likes" ? "Posts you like will appear here so you can find them again." : "This profile section will become available as more content features are added.";
    return <div className="screen-stack"><section className="profile-page-card"><div className="profile-page-cover"><button className="cover-edit" onClick={()=>notify("Cover photo uploads are planned for a later update.")}><Camera size={15}/> Edit cover</button></div><div className="profile-page-body"><Avatar initials={myInitials} size="profile-avatar"/><button className="outline-button edit-profile-button" onClick={()=>setEditProfile(true)}><Pencil size={14}/> Edit profile</button><h2>{displayName}</h2><span className="profile-handle">{handle}</span><p>{profileBio}</p><div className="profile-page-stats"><span><b>{myPosts.length}</b> posts</span><span><b>{following.length}</b> following</span><span><b>{followerCount}</b> followers</span></div><div className="profile-tabs">{["Posts","Replies","Media","Likes"].map(t=><button className={profileTab===t?"tab-active":""} onClick={()=>setProfileTab(t)} key={t}>{t}</button>)}</div></div></section>{(profileTab==="Posts"||profileTab==="Likes")&&visibleProfilePosts.length ? visibleProfilePosts.map(post=><PostCard post={post} key={post.id}/>) : <div className="empty-panel compact-empty"><h3>{emptyTitle}</h3><p>{emptyCopy}</p>{profileTab==="Posts"&&<button className="primary-button" onClick={()=>setComposerOpen(true)}><Plus size={16}/> Create post</button>}</div>}</div>;
  }
  function CreatorStudioPage() {
    return <div className="screen-stack"><section className="feature-panel"><div><span className="welcome-pill"><Sparkles size={13}/> CREATOR SPACE</span><h2>Make something meaningful.</h2><p>Draft your next post, review your recent activity, and keep your ideas moving.</p><button className="primary-button" onClick={()=>setComposerOpen(true)}><Plus size={16}/> Create a post</button></div><WandSparkles size={58}/></section><div className="stats-grid"><div className="stat-card"><span>Posts in preview</span><b>{posts.filter(p=>p.handle===handle).length}</b><small><FileText size={14}/> Published drafts</small></div><div className="stat-card"><span>Total likes</span><b>{posts.filter(p=>p.handle===handle).reduce((n,p)=>n+p.likes,0)}</b><small><Heart size={14}/> Engagement preview</small></div><div className="stat-card"><span>Following</span><b>{following.length}</b><small><Users size={14}/> Your connections</small></div></div><section className="content-panel"><div className="section-title"><h2>Your recent posts</h2><button className="text-button" onClick={()=>go("Profile")}>View profile</button></div>{posts.filter(p=>p.handle===handle).length?posts.filter(p=>p.handle===handle).map(p=><PostCard post={p} key={p.id}/>):<p className="empty-state">You haven't published a post in this preview yet.</p>}</section><section className="content-panel"><div className="section-title"><h2>Creator tools</h2></div><div className="tool-grid"><button onClick={()=>setComposerOpen(true)}><Pencil size={19}/><strong>Post composer</strong><span>Write and share an update</span></button><button onClick={()=>go("Explore")}><TrendingUp size={19}/><strong>Discover trends</strong><span>Find relevant conversations</span></button><button onClick={()=>go("AI Assistant")}><Bot size={19}/><strong>Idea assistant</strong><span>Get help with your next idea</span></button></div></section></div>;
  }
  function AssistantPage() { return <div className="assistant-page"><section className="assistant-hero"><div className="assistant-orb"><Sparkles size={28}/></div><span className="welcome-pill">GISTY AI · YOUR CREATIVE SIDEKICK</span><h2>What are we creating today?</h2><p>Brainstorm post ideas, refine a caption, plan community conversations, and find a fresh way to tell your story.</p><div className="prompt-chips">{["Give me post ideas","Improve my caption","Suggest a community topic"].map(x=><button key={x} onClick={()=>setAssistantPrompt(x)}>{x}</button>)}</div></section>{assistantReply&&<div className="assistant-reply"><Avatar initials="GA" tone="lavender"/><div><strong>Gisty AI</strong><p>{assistantReply}</p></div></div>}<div className="assistant-input"><textarea value={assistantPrompt} onChange={e=>setAssistantPrompt(e.target.value)} maxLength={2000} placeholder="Tell Gisty AI what you want help with…"/><button className="primary-button" onClick={askGistyAI} disabled={!assistantPrompt.trim()||assistantBusy}>{assistantBusy?"Thinking…":<><Send size={16}/> Ask Gisty AI</>}</button><small>Gisty AI may make mistakes. Review suggestions before posting.</small></div></div>; }
  function AdsManagerPage() {
    return <div className="screen-stack">
      <section className="feature-panel"><div><span className="welcome-pill"><Megaphone size={13}/> PROMOTION WORKSPACE</span><h2>Help the right people find you.</h2><p>Build campaign drafts, set a goal, and plan a daily budget before ads are reviewed for delivery.</p><button className="primary-button" onClick={()=>setCampaignModalOpen(true)}><Plus size={16}/> Create campaign</button></div><BarChart3 size={56}/></section>
      <div className="stats-grid"><div className="stat-card"><span>Campaign drafts</span><b>{campaigns.length}</b><small><FileText size={14}/> Saved to your account</small></div><div className="stat-card"><span>Reach</span><b>—</b><small>Available after ad delivery launches</small></div><div className="stat-card"><span>Spend</span><b>₦0</b><small>No billing or ads are active</small></div></div>
      <section className="content-panel"><h2 className="panel-heading">Campaign workspace</h2>{campaigns.length?campaigns.map(campaign=><div className="setting-row" key={campaign.id}><div><strong>{campaign.name}</strong><span>{campaign.goal} · ₦{Number(campaign.daily_budget).toLocaleString("en-NG")} per day</span><small>{campaign.audience||"Audience not specified"} · {campaign.status.replace("_"," ")}</small></div><span className="welcome-pill">{campaign.status==="draft"?"DRAFT":campaign.status.toUpperCase()}</span></div>):<div className="empty-state-box"><Megaphone size={26}/><strong>No campaigns yet</strong><p>Create a campaign draft to start planning. Drafts are saved, but they do not run ads or collect payments.</p></div>}</section>
      {campaignModalOpen&&<div className="modal-backdrop" onClick={()=>setCampaignModalOpen(false)}><section className="composer-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2>Create campaign</h2><button className="icon-button" onClick={()=>setCampaignModalOpen(false)}><X size={20}/></button></div><p className="muted">Your campaign will be saved as a draft. It will not run or charge you.</p><label className="auth-label">Campaign name<input value={campaignName} onChange={e=>setCampaignName(e.target.value)} maxLength={100} placeholder="e.g. Launch week awareness"/></label><label className="auth-label">Campaign goal<select value={campaignGoal} onChange={e=>setCampaignGoal(e.target.value)}><option>Reach</option><option>Engagement</option><option>Website visits</option><option>Followers</option></select></label><label className="auth-label">Daily budget (₦)<input type="number" min="100" max="100000000" step="100" value={campaignBudget} onChange={e=>setCampaignBudget(e.target.value)}/></label><label className="auth-label">Target audience<input value={campaignAudience} onChange={e=>setCampaignAudience(e.target.value)} maxLength={240} placeholder="e.g. Students and young creators in Lagos"/></label><button className="primary-button auth-main-btn" onClick={createCampaign} disabled={campaignBusy}>{campaignBusy?"Saving…":"Save campaign draft"} <ArrowRight size={16}/></button></section></div>}
    </div>;
  }
  function SettingsPage() {
    const tabs=["Account","Privacy","Notifications","Appearance","Blocked accounts","Data & account"];
    return <div className="settings-layout"><section className="settings-menu">{tabs.map(t=><button key={t} className={settingsTab===t?"settings-selected":""} onClick={()=>setSettingsTab(t)}>{t==="Account"?<UserRound size={17}/>:t==="Privacy"?<Shield size={17}/>:t==="Notifications"?<Bell size={17}/>:t==="Appearance"?<Moon size={17}/>:t==="Blocked accounts"?<Ban size={17}/>:<Lock size={17}/>} {t}<ChevronRight size={15}/></button>)}</section><section className="settings-content"><h2>{settingsTab}</h2><p className="muted">Manage how Gist Up works for you.</p>{settingsTab==="Account"&&<><div className="setting-row"><div><strong>Profile information</strong><span>Change your name, handle and bio.</span></div><button className="outline-button compact" onClick={()=>setEditProfile(true)}>Edit profile</button></div><div className="setting-row"><div><strong>Email address</strong><span>{email||"Not connected in preview"}</span></div><button className="text-button" onClick={()=>notify("Email changes require a connected account.")}>Manage</button></div><div className="setting-row"><div><strong>Password & security</strong><span>Sign-in security is not connected yet.</span></div><Lock size={18}/></div></>}{settingsTab==="Privacy"&&<><div className="setting-row"><div><strong>Private account</strong><span>Review who can follow and see your posts.</span></div><button className={"toggle "+(privateAccount?"toggle-on":"")} onClick={()=>setPrivateAccount(!privateAccount)} aria-label="Toggle private account"><i/></button></div><div className="setting-row"><div><strong>Message requests</strong><span>Choose who can start a conversation.</span></div><button className="text-button" onClick={()=>notify("Message request controls are a preview.")}>Manage</button></div><div className="setting-row"><div><strong>Discoverability</strong><span>Control how people find your profile.</span></div><button className="text-button" onClick={()=>notify("Discoverability controls will be connected later.")}>Review</button></div></>}{settingsTab==="Notifications"&&<>{["New followers","Likes and comments","Messages","Community activity"].map(x=><div className="setting-row" key={x}><div><strong>{x}</strong><span>Receive updates about {x.toLowerCase()}.</span></div><button className="toggle toggle-on" onClick={e=>e.currentTarget.classList.toggle("toggle-on")}><i/></button></div>)}</>}{settingsTab==="Appearance"&&<><div className="setting-row"><div><strong>Dark appearance</strong><span>Switch this preview to a darker interface.</span></div><button className={"toggle "+(darkMode?"toggle-on":"")} onClick={()=>{setDarkMode(!darkMode);document.body.classList.toggle("dark-preview",!darkMode)}}><i/></button></div><div className="setting-row"><div><strong>Theme colour</strong><span>Gist Up purple is the current brand theme.</span></div><span className="theme-dot"/></div></>}{settingsTab==="Blocked accounts"&&<>{blocked.length?blocked.map(p=><div className="setting-row" key={p.handle}><Avatar initials={p.initials} tone={p.tone}/><div><strong>{p.name}</strong><span>{p.handle}</span></div><button className="outline-button compact" onClick={()=>toggleBlock(p,false)}>Unblock</button></div>):<div className="empty-state-box"><Ban size={25}/><strong>No blocked accounts</strong><p>People you block will be listed here.</p></div>}<h3 className="subheading">Registered accounts</h3>{people.filter(p=>!blocked.some(b=>b.handle===p.handle)).map(p=><div className="setting-row" key={p.handle}><Avatar initials={p.initials} tone={p.tone}/><div><strong>{p.name}</strong><span>{p.handle}</span></div><button className="outline-button compact" onClick={()=>toggleBlock(p,true)}>Block</button></div>)}{!people.length&&<p className="muted">No other registered accounts to show yet.</p>}</>}{settingsTab==="Data & account"&&<><div className="setting-row"><div><strong>Download your information</strong><span>Account export is not available in this preview.</span></div><button className="text-button" onClick={()=>notify("Data export needs backend support.")}>Request</button></div><div className="setting-row"><div><strong>Deactivate account</strong><span>Temporarily pause your account.</span></div><button className="text-button" onClick={()=>notify("Account actions require a real account.")}>Review</button></div><div className="setting-row danger-row"><div><strong>Delete account</strong><span>Permanent account deletion is not connected.</span></div><button className="text-button" onClick={()=>notify("No account was deleted. Account controls are preview-only.")}><Trash2 size={15}/> Review</button></div></>}</section></div>;
  }
  function AuthPage() {
    return <div className="auth-shell"><div className="auth-left"><button className="brand auth-brand" onClick={()=>setAuthMode("welcome")}><span className="brand-mark">g</span><span>gist<span className="brand-up">up</span></span></button><div className="auth-promo"><span className="welcome-pill"><Sparkles size={13}/> YOUR PEOPLE. YOUR STORIES.</span><h1>A little more connection.<br/><span>A lot more you.</span></h1><p>Share your story, discover new perspectives, and find the people who make your world feel bigger.</p><div className="auth-floating-card"><div className="mini-avatars"><i>M</i><i>D</i><i>A</i></div><strong>Real people. Shared moments.</strong><small>Your next favourite conversation is out there.</small></div></div><div className="auth-foot">Made for the stories that bring us together. · © 2026 Gist Up</div></div><div className="auth-right"><div className="auth-form-wrap">{authMode==="welcome"?<><div className="auth-mobile-logo"><span className="brand-mark">g</span> gist<span className="brand-up">up</span></div><span className="eyebrow">WELCOME TO GIST UP</span><h2>Your people are here.</h2><p>Join conversations, share what matters, and make your space your own.</p><button className="primary-button auth-main-btn" onClick={()=>setAuthMode("signup")}>Create your account <ArrowRight size={17}/></button><button className="google-button" onClick={()=>notify("Google sign-in is not connected in this preview.")}><span className="google-g">G</span> Continue with Google</button><div className="auth-separator"><span>or</span></div><button className="outline-button auth-main-btn" onClick={()=>setAuthMode("login")}>Log in</button><button className="text-button preview-entry" onClick={()=>setAuthMode("app")}>Explore the website preview <ArrowRight size={15}/></button><small>By continuing, you agree to our Terms and Privacy Policy.</small></>:<><button className="back-link" onClick={()=>setAuthMode("welcome")}>← Back</button><span className="eyebrow">{authMode==="signup"?"GET STARTED":"WELCOME BACK"}</span><h2>{authMode==="signup"?"Create your account":"Log in to Gist Up"}</h2><p>{authMode==="signup"?"A few details and you're on your way.":"Your people and conversations are waiting."}</p>{authMode==="signup"&&<label className="auth-label">Full name<input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name"/></label>}<label className="auth-label">Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label className="auth-label">Password<span className="password-input"><input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/><button onClick={()=>setShowPassword(!showPassword)} type="button" aria-label="Show password">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></label><button className="primary-button auth-main-btn" onClick={submitAuth} disabled={authBusy}>{authBusy ? "Please wait…" : authMode==="signup" ? "Create account" : "Log in"} <ArrowRight size={16}/></button>{authError && <p className="auth-error" role="alert">{authError}</p>}<div className="auth-switch">{authMode==="signup"?"Already have an account?":"New to Gist Up?"} <button onClick={()=>setAuthMode(authMode==="signup"?"login":"signup")}>{authMode==="signup"?"Log in":"Create an account"}</button></div><small>"Your account is protected by the Gist Up account service."</small></>}</div></div></div>;
  }
  if (authMode!=="app") return <>{AuthPage()}{notice&&<div className="toast" role="status">{notice}</div>}</>;
  const page = active==="Home"?<HomePage/>:active==="Explore"?<ExplorePage/>:active==="Communities"?<CommunitiesPage/>:active==="Messages"?<MessagesPage/>:active==="Notifications"?<NotificationsPage/>:active==="Saved"?<SavedPage/>:active==="Profile"?<ProfilePage/>:active==="Creator Studio"?<CreatorStudioPage/>:active==="AI Assistant"?<AssistantPage/>:active==="Ads Manager"?<AdsManagerPage/>:active==="Settings & Privacy"?<SettingsPage/>:<HomePage />;
  return <div className="app-shell">
    <header className="topbar"><button className="mobile-menu icon-button" aria-label="Toggle navigation" onClick={()=>setMobileNav(!mobileNav)}>{mobileNav?<X size={20}/>:<Menu size={20}/>}</button><button className="brand" onClick={()=>go("Home")}><span className="brand-mark">g</span><span>gist<span className="brand-up">up</span></span></button><label className="searchbox"><Search size={18}/><input aria-label="Search" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")go("Explore")}} placeholder="Search people, topics, and communities"/><kbd>⌘ K</kbd></label><div className="top-actions"><button className="icon-button" aria-label="Notifications" onClick={()=>go("Notifications")}><Bell size={20}/><i/></button><button className="top-profile" onClick={()=>go("Profile")}><Avatar initials={myInitials} size="small"/><span className="profile-name">{displayName}</span></button></div></header>
    {notice&&<div className="toast" role="status">{notice}</div>}
    <div className="layout"><aside className={"left-sidebar "+(mobileNav?"open":"")}><div className="sidebar-label">MENU</div>{navigation.map(({label,icon:Icon})=><button key={label} className={"nav-item "+(active===label?"selected":"")} onClick={()=>go(label)}><Icon size={19}/><span>{label}</span>{label==="Notifications"&&notifications.some(item=>!item.is_read)&&<b className="nav-count">{notifications.filter(item=>!item.is_read).length}</b>}</button>)}<div className="sidebar-divider"/><div className="sidebar-label">YOUR SPACE</div>{spaces.map(({label,name,icon:Icon,desc})=><button key={name} title={desc} className={"nav-item "+(active===name?"selected":"")} onClick={()=>go(name)}><Icon size={19}/><span>{name}</span></button>)}<button className={"nav-item "+(active==="Profile"?"selected":"")} onClick={()=>go("Profile")}><UserRound size={19}/><span>My profile</span></button><div className="sidebar-card"><div className="sidebar-card-icon"><Sparkles size={18}/></div><strong>Make your space yours</strong><p>Find your people and join conversations that matter to you.</p><button onClick={()=>go("Explore")}>Explore Gist Up <ArrowRight size={14}/></button></div><div className="sidebar-footer">About · Guidelines · Privacy<p>© 2026 Gist Up</p><button className="text-button" onClick={signOut}><LogOut size={13}/> Sign out</button></div></aside>
    <main className="feed-column"><HeaderTitle/>{page}</main>
    <aside className="right-sidebar"><section className="right-card profile-card"><div className="profile-cover"/><div className="profile-card-body"><Avatar initials={myInitials} size="large"/><strong>{displayName}</strong><span>{handle}</span><p>{profileBio}</p><div className="profile-metrics"><div><b>{following.length}</b><span>Following</span></div><div><b>{followerCount}</b><span>Followers</span></div><div><b>{posts.filter(p=>p.handle===handle).length}</b><span>Posts</span></div></div><button className="outline-button" onClick={()=>go("Profile")}>View profile</button></div></section><section className="right-card trends-card"><div className="right-card-heading"><h3><TrendingUp size={17}/> What's happening</h3><button onClick={()=>go("Explore")}>See all</button></div>{[["#CreativeCommunity","2.4k posts","Creators"],["#MondayMotivation","1.8k posts","Lifestyle"],["#DesignTalk","956 posts","Technology"]].map(([tag,count,category])=><button className="trend-row" key={tag} onClick={()=>{setQuery(tag);go("Explore")}}><span>{category} · Trending</span><strong>{tag}</strong><small>{count}</small></button>)}</section><section className="right-card suggestions-card"><div className="right-card-heading"><h3>People to know</h3><button onClick={()=>go("Explore")}>See all</button></div>{people.slice(0,3).map(p=><div className="suggestion-row" key={p.handle}><Avatar initials={p.initials} tone={p.tone}/><div className="suggestion-info"><strong>{p.name}</strong><span>{p.handle}</span></div><button className="follow-button" onClick={()=>toggleFollow(p)}>{following.includes(p.handle)?"Following":"Follow"}</button></div>)}</section><footer className="right-footer">About · Help · Community Guidelines<br/>Privacy · Terms · Cookies<br/><span>© 2026 Gist Up</span></footer></aside></div>
    {composerOpen&&<div className="modal-backdrop" onClick={()=>setComposerOpen(false)}><section className="composer-modal" role="dialog" aria-modal="true" aria-labelledby="composer-title" onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2 id="composer-title">Create a post</h2><button className="icon-button" aria-label="Close" onClick={()=>setComposerOpen(false)}><X size={20}/></button></div><div className="modal-user"><Avatar initials={myInitials} size="medium"/><div><strong>{displayName}</strong><span>Sharing with everyone</span></div></div><textarea autoFocus value={postText} onChange={e=>setPostText(e.target.value)} placeholder="What's on your mind?" maxLength={5000}/><div className="modal-bottom"><span>{postText.length}/5000</span><button className="primary-button" disabled={!postText.trim()||postBusy} onClick={publish}>{postBusy?"Publishing…":"Publish post"} <ArrowRight size={16}/></button></div><p className="preview-note">Your post will be saved to your Gist Up account.</p></section></div>}
    {reportPost&&<div className="modal-backdrop" onClick={()=>setReportPost(null)}><section className="composer-modal edit-modal" role="dialog" aria-modal="true" aria-labelledby="report-title" onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2 id="report-title">Report post</h2><button className="icon-button" aria-label="Close report dialog" onClick={()=>setReportPost(null)}><X size={20}/></button></div><p className="muted">Tell us why this post may violate Gist Up's community guidelines. Reports are saved for review.</p><label className="auth-label">Reason<select value={reportReason} onChange={e=>setReportReason(e.target.value)}><option>Spam</option><option>Harassment or bullying</option><option>Hate or abuse</option><option>False information</option><option>Other</option></select></label><label className="auth-label">Additional details (optional)<textarea value={reportDetails} onChange={e=>setReportDetails(e.target.value)} maxLength={500} placeholder="Share any context that may help the review."/></label><button className="primary-button auth-main-btn" onClick={submitReport} disabled={reportBusy}>{reportBusy?"Sending report…":"Submit report"} <ArrowRight size={16}/></button></section></div>}
    {commentPost!==null&&<div className="modal-backdrop" onClick={()=>setCommentPost(null)}><section className="composer-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2>Comments</h2><button className="icon-button" onClick={()=>setCommentPost(null)}><X size={20}/></button></div><p className="muted">Comments are saved to this post.</p><div className="post-comments-list">{commentsBusy?<p className="muted">Loading comments…</p>:postComments.length?postComments.map(comment=><div className="saved-comment" key={comment.id}><strong>{comment.full_name || comment.username}</strong><p>{comment.content}</p><small>{new Date(comment.created_at).toLocaleString()}</small></div>):<p className="muted">No comments yet. Start the conversation.</p>}</div><div className="comment-input"><input value={commentText} onChange={e=>setCommentText(e.target.value)} maxLength={2000} placeholder="Write a comment…"/><button className="primary-button" onClick={submitComment} disabled={!commentText.trim()}><Send size={15}/></button></div></section></div>}
    {editProfile&&<div className="modal-backdrop" onClick={()=>setEditProfile(false)}><section className="composer-modal edit-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2>Edit profile</h2><button className="icon-button" onClick={()=>setEditProfile(false)}><X size={20}/></button></div><label className="auth-label">Display name<input value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={50}/></label><label className="auth-label">Username<input value={handle} onChange={e=>setHandle(e.target.value.startsWith("@")?e.target.value:"@"+e.target.value)} maxLength={30}/></label><label className="auth-label">Bio<textarea value={profileBio} onChange={e=>setProfileBio(e.target.value)} maxLength={160}/></label><button className="primary-button auth-main-btn" onClick={saveProfile}><Check size={16}/> Save changes</button><p className="preview-note">Your display name, username, and bio will be saved to your account.</p></section></div>}
  </div>;
}
createRoot(document.getElementById("root")).render(<App />);
