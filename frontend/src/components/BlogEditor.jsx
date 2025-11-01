import React, { useState, useEffect, useRef, useContext } from 'react';
import api from '../utils/axios';
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
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [blogId, setBlogId] = useState(null); // To store the ID of the saved draft or fetched blog
  const [blogOwnerId, setBlogOwnerId] = useState(null); // To store the ID of the blog's owner
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [blog, setBlog] = useState(null);

  // Ref for the typing timer
  const typingTimerRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  // Fetch blog data if ID is present (for editing)
  useEffect(() => {
    const fetchBlog = async () => {
      if (id) {
        try {
          const response = await api.get(`/api/blogs/${id}`); // Use custom api instance
          setBlog(response.data);
          setIsEditing(true);
          setTitle(response.data.title);
          setContent(response.data.content); // Load HTML content into state
          setTags(response.data.tags ? response.data.tags.join(', ') : '');
          setImageUrl(response.data.imageUrl || '');
          setImagePreview(response.data.imageUrl ? `${import.meta.env.VITE_API_URL}${response.data.imageUrl}` : null);
          setBlogId(response.data._id); // Set the blog ID for updates
          setBlogOwnerId(response.data.user._id); // Set the owner ID
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
      } else {
        setLoading(false);
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setUploadingImage(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      // Upload image
      const uploadResponse = await api.post('/api/blogs/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedImageUrl = uploadResponse.data.imageUrl;
      setImageUrl(uploadedImageUrl);
      setImagePreview(`${import.meta.env.VITE_API_URL}${uploadedImageUrl}`);
      setUploadingImage(false);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
      setUploadingImage(false);
      setImageFile(null);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageFile(null);
    setImagePreview(null);
  };

  const saveDraft = async () => {
    if (!user || (id && blogOwnerId && user._id !== blogOwnerId)) { // Ensure user is logged in and is the owner if editing
      alert('You are not authorized to save this blog.');
      return;
    }
    // Check if title is empty before attempting to save
    if (!title || title.trim() === '') {
      console.log('Title is required to save a draft.');
      // Optionally, show a user-facing message
      // alert('Please add a title before saving the draft.');
      return;
    }
    // Add a check to ensure blog.content is not just empty HTML tags from Quill
    const contentWithoutTags = content.replace(/<[^>]*>/g, '').trim();
    if (!contentWithoutTags) {
      console.log('Content is empty after removing HTML tags.');
      return;
    }

    try {
      const blogData = {
        title,
        content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        status: 'draft',
        imageUrl: imageUrl || undefined,
      };
      let response;
      if (blogId) {
        response = await api.patch(`/api/blogs/${blogId}`, blogData); // Use custom api instance
        console.log('Draft updated:', response.data);
      } else {
        response = await api.post('/api/blogs', blogData); // Use custom api instance
        setBlogId(response.data._id); // Save the new blog ID
        console.log('Draft saved:', response.data);
        // If saving a new draft, navigate to the edit page for that draft
        if (!isEditing) {
          navigate(`/edit-blog/${response.data._id}`);
        }
        setIsEditing(true); // Now we are editing the saved draft
        setBlog(response.data); // Update state with the saved draft data (e.g., timestamps)
      }
      console.log('Auto-save successful.');
    } catch (err) {
      console.error('Auto-save failed:', err);
      // Handle error (e.g., show an error message to the user)
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
    // Check if title and content are present before publishing
    if (!title || title.trim() === '') {
      alert('Please add a title before publishing.');
      return;
    }
    const contentWithoutTags = content.replace(/<[^>]*>/g, '').trim();
    if (!contentWithoutTags) {
      alert('Please add content before publishing.');
      return;
    }

    try {
      const blogData = {
        title,
        content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        status: 'published',
        imageUrl: imageUrl || undefined,
      };
      let response;
      if (blogId) {
        response = await api.patch(`/api/blogs/${blogId}`, blogData); // Use custom api instance
        console.log('Blog updated and published:', response.data);
      } else {
        response = await api.post('/api/blogs', blogData); // Use custom api instance
        console.log('Blog published:', response.data);
      }
      alert('Blog published successfully!');
      navigate(`/blogs/${response.data._id}`); // Navigate to the published blog post
    } catch (err) {
      console.error('Publish failed:', err);
      alert('Failed to publish blog. See console for details.');
    }
  };

  const handleDelete = async () => {
    if (!user || (id && blogOwnerId && user._id !== blogOwnerId)) { // Ensure user is logged in and is the owner if editing
      alert('You are not authorized to delete this blog.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await api.delete(`/api/blogs/${blogId}`); // Use custom api instance
        alert('Blog deleted successfully!');
        navigate('/my-blogs'); // Or wherever you want to redirect after deletion
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete blog. See console for details.');
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
      <div className="mb-4">
        <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">
          Featured Image (Optional):
        </label>
        {imagePreview && (
          <div className="mb-3 relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-w-md max-h-64 rounded-lg shadow-md"
            />
            {!(id && blogOwnerId && user && user._id !== blogOwnerId) && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Remove
              </button>
            )}
          </div>
        )}
        {!(id && blogOwnerId && user && user._id !== blogOwnerId) && (
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploadingImage}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        )}
        {uploadingImage && (
          <p className="text-blue-600 text-sm mt-2">Uploading image...</p>
        )}
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