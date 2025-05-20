import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import AuthContext from '../context/AuthContext';

function BlogEditor() {
  const { id } = useParams(); // Get ID from URL for editing
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext); // Get authenticated user info

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Content will now hold HTML from Quill
  const [tags, setTags] = useState('');
  const [blogId, setBlogId] = useState(null); // To store the ID of the saved draft or fetched blog
  const [blogOwnerId, setBlogOwnerId] = useState(null); // To store the ID of the blog's owner
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref for the typing timer
  const typingTimerRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  // Fetch blog data if ID is present (for editing)
  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) { // If no ID, it's a new blog
        setLoading(false);
        return;
      }

      try {
         const token = localStorage.getItem('token'); 
         const config = {
           headers: {
             'x-auth-token': token,
           },
         };
          
        // Fetch single blog post
        const res = await axios.get(`/api/blogs/${id}`, config);
        
        setTitle(res.data.title);
        setContent(res.data.content); // Load HTML content into state
        setTags(res.data.tags ? res.data.tags.join(', ') : '');
        setBlogId(res.data._id); // Set the blog ID for updates
        setBlogOwnerId(res.data.user._id); // Set the owner ID
        setLoading(false);

      } catch (err) {
        console.error('Error fetching blog:', err.response.data);
        setError(err);
        setLoading(false);
        alert('Error fetching blog or you are not authorized to edit this blog.');
        // TODO: More specific error message or redirect based on status code (e.g., 401)
        if (err.response && (err.response.status === 401 || err.response.status === 404)) {
             navigate('/'); // Redirect to blog list if not found or unauthorized
         }
      }
    };

    fetchBlog();

    // Cleanup timers on component unmount or ID change
    return () => {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [id, navigate]); // Re-run effect if ID changes or navigate changes

    // Auto-save every 30 seconds
  useEffect(() => {
      if (loading || authLoading || !user) return; // Don't autosave if loading, auth loading, or not logged in
      if (id && blogOwnerId && user._id !== blogOwnerId) return; // Don't autosave if editing someone else's blog

    // Clear previous timer before setting a new one
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setInterval(() => {
      saveDraft();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(autoSaveTimerRef.current);
    };
  }, [title, content, tags, blogId, user, loading, authLoading, blogOwnerId]); // Re-run if these change

  // Auto-save when user stops typing for 5 seconds (for title and tags)
  useEffect(() => {
     if (loading || authLoading || !user) return; // Don't autosave if loading, auth loading, or not logged in
      if (id && blogOwnerId && user._id !== blogOwnerId) return; // Don't autosave if editing someone else's blog

    // Clear previous timer on input change
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    // Set a new timer
    typingTimerRef.current = setTimeout(() => {
       saveDraft(); // Trigger save after typing stops in title or tags
    }, 5000); // 5 seconds after last type

    // Cleanup timer on component unmount
    return () => {
      clearTimeout(typingTimerRef.current);
    };
  }, [title, tags, user, loading, authLoading, blogOwnerId]); // Re-run effect when title or tags change

    // Auto-save when Quill content changes (with debounce)
  useEffect(() => {
      if (loading || authLoading || !user) return; // Don't autosave if loading, auth loading, or not logged in
      if (id && blogOwnerId && user._id !== blogOwnerId) return; // Don't autosave if editing someone else's blog

     // Clear previous timer on content change
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    // Set a new timer
    typingTimerRef.current = setTimeout(() => {
      saveDraft(); // Trigger save after typing stops in content
    }, 5000); // 5 seconds after last type

    // Cleanup timer on component unmount
    return () => {
      clearTimeout(typingTimerRef.current);
    };
  }, [content, user, loading, authLoading, blogOwnerId]); // Re-run effect when content changes


  const saveDraft = async () => {
     if (!user || (id && blogOwnerId && user._id !== blogOwnerId)) { // Ensure user is logged in and is the owner if editing
        alert('You are not authorized to save this blog.');
        return;
    }
    // Only save if there's a title
    if (!title) {
        // alert('Title is required to save a draft.'); // Optional: provide feedback
        return;
    }

    try {
      const token = localStorage.getItem('token'); 
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      };

      const blogData = {
        title,
        content, // Content is already HTML from Quill
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        status: 'draft',
      };

      let res;
      if (blogId) {
        // Update existing draft
        res = await axios.patch(`/api/blogs/${blogId}`, blogData, config);
        console.log('Draft updated:', res.data);
      } else {
        // Create new draft
        res = await axios.post('/api/blogs', blogData, config);
        setBlogId(res.data._id); // Save the new blog ID
        console.log('Draft saved:', res.data);
      }
      // alert('Draft saved automatically.'); // Avoid excessive alerts
    } catch (err) {
      console.error('Auto-save failed:', err.response.data);
       // alert('Error saving draft automatically.'); // Avoid excessive alerts
    }
  };

  const handleSaveDraft = async () => {
     if (!user || (id && blogOwnerId && user._id !== blogOwnerId)) {
        alert('You are not authorized to save this blog.');
        return;
    }
     if (!title) {
        alert('Title is required to save a draft manually.');
        return;
    }
    await saveDraft(); // Call the saveDraft function
    alert('Draft saved manually!');
  };

  const handlePublish = async () => {
      if (!user || (id && blogOwnerId && user._id !== blogOwnerId)) { // Ensure user is logged in and is the owner if editing
        alert('You are not authorized to publish this blog.');
        return;
    }
     if (!title || !content) {
        alert('Title and content are required to publish.');
        return;
    }

     const token = localStorage.getItem('token');
      const config = {
       headers: {
         'Content-Type': 'application/json',
         'x-auth-token': token,
       },
     };

     const blogData = {
       title,
       content, // Content is already HTML from Quill
       tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
       status: 'published',
     };

    try {
      let res;
       if (blogId) {
        // Update existing draft to published
        res = await axios.patch(`/api/blogs/${blogId}`, blogData, config);
        console.log('Blog updated and published:', res.data);
      } else {
         // Create new blog and publish
        res = await axios.post('/api/blogs', blogData, config);
        console.log('Blog published:', res.data);
      }
      alert('Blog published successfully!');
      navigate('/'); // Redirect to the blog list page
    } catch (err) {
      console.error(err.response.data);
      alert('Error publishing blog.');
    }
  };

  const handleDelete = async () => {
     if (!user || (id && blogOwnerId && user._id !== blogOwnerId)) { // Ensure user is logged in and is the owner if editing
        alert('You are not authorized to delete this blog.');
        return;
    }

    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const token = localStorage.getItem('token');
         const config = {
          headers: {
            'x-auth-token': token,
          },
        };
        await axios.delete(`/api/blogs/${blogId}`, config);
        alert('Blog deleted successfully!');
        navigate('/'); // Redirect to the blog list page
      } catch (err) {
        console.error(err.response.data);
        alert('Error deleting blog.');
      }
    }
  };

  if (loading || authLoading) {
      return <div className="container mx-auto px-4 py-8 text-center"><p>Loading editor...</p></div>;
  }

  // Prevent editing if not the owner (after loading is complete)
    if (id && blogOwnerId && user && user._id !== blogOwnerId) {
        return <div className="container mx-auto px-4 py-8 text-center text-red-600"><p>You are not authorized to edit this blog.</p></div>;
    }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
        <input
          type="text"
          id="title"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
           disabled={id && blogOwnerId && user && user._id !== blogOwnerId} // Disable input if not owner
        />
      </div>
      <div className="mb-4">
        <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Content:</label>
        <ReactQuill
          value={content}
          onChange={setContent}
          className="h-64 mb-12"
           readOnly={id && blogOwnerId && user && user._id !== blogOwnerId} // Disable editor if not owner
        />
      </div>
      <div className="mb-4 mt-12">
        <label htmlFor="tags" className="block text-gray-700 text-sm font-bold mb-2">Tags (comma-separated):</label>
        <input
          type="text"
          id="tags"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
           disabled={id && blogOwnerId && user && user._id !== blogOwnerId} // Disable input if not owner
        />
      </div>
      {!(id && blogOwnerId && user && user._id !== blogOwnerId) && ( // Hide buttons if not owner
        <div className="flex items-center justify-between">
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handleSaveDraft}
          >
            Save as Draft
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handlePublish}
          >
            {id ? 'Update and Publish' : 'Publish'}
          </button>
           {id && ( // Show delete only if editing
            <button
              className="bg-red-500 hover:bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default BlogEditor;