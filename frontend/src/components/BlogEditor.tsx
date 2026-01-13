import React, { useState, useEffect, useRef, useContext, ChangeEvent, FormEvent } from 'react';
import api from '../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import AuthContext, { AuthContextType } from '../context/AuthContext';
import { Blog } from '../types';
import { DiVim } from 'react-icons/di';

interface UploadImageResponse {
  imageUrl: string;
}
interface GenerateBlogResponse {
  content: string;
}

const BlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('AuthContext must be used within AuthProvider');
  }

  const { user, loading: authLoading }: AuthContextType = context;

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [blogId, setBlogId] = useState<string | null>(null);
  const [blogOwnerId, setBlogOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [blog, setBlog] = useState<Blog | null>(null);

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchBlog = async (): Promise<void> => {
      if (id) {
        try {
          const response = await api.get<Blog>(`/api/blogs/${id}`);
          setBlog(response.data);
          setIsEditing(true);
          setTitle(response.data.title);
          setContent(response.data.content);
          setTags(response.data.tags ? response.data.tags.join(', ') : '');
          setImageUrl(response.data.imageUrl || '');
          setImagePreview(response.data.imageUrl ? `${import.meta.env.VITE_API_URL}${response.data.imageUrl}` : null);
          setBlogId(response.data._id);
          setBlogOwnerId(response.data.user._id);
          setLoading(false);
        } catch (err: any) {
          console.error('Error fetching blog:', err.response?.data);
          setError(err);
          setLoading(false);
          alert('Error fetching blog or you are not authorized to edit this blog.');
          if (err.response && (err.response.status === 401 || err.response.status === 404)) {
            navigate('/');
          }
        }
      } else {
        setLoading(false);
      }
    };

    fetchBlog();

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [id, navigate]);

  useEffect(() => {
    if (loading || authLoading || !user) return;
    if (id && blogOwnerId && user._id !== blogOwnerId) return;

    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setInterval(() => {
      saveDraft();
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [title, content, tags, blogId, user, loading, authLoading, blogOwnerId, id]);

  useEffect(() => {
    if (loading || authLoading || !user) return;
    if (id && blogOwnerId && user._id !== blogOwnerId) return;

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      saveDraft();
    }, 5000);

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [title, tags, user, loading, authLoading, blogOwnerId, id]);

  useEffect(() => {
    if (loading || authLoading || !user) return;
    if (id && blogOwnerId && user._id !== blogOwnerId) return;

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      saveDraft();
    }, 5000);

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [content, user, loading, authLoading, blogOwnerId, id]);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await api.post<UploadImageResponse>('/api/blogs/upload-image', formData, {
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

  const handleRemoveImage = (): void => {
    setImageUrl('');
    setImageFile(null);
    setImagePreview(null);
  };

  const saveDraft = async (): Promise<void> => {
    if (!user || (id && blogOwnerId && user._id !== blogOwnerId)) {
      alert('You are not authorized to save this blog.');
      return;
    }
    if (!title || title.trim() === '') {
      console.log('Title is required to save a draft.');
      return;
    }
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
        status: 'draft' as const,
        imageUrl: imageUrl || undefined,
      };
      let response;
      if (blogId) {
        response = await api.patch<Blog>(`/api/blogs/${blogId}`, blogData);
      } else {
        response = await api.post<Blog>('/api/blogs', blogData);
        setBlogId(response.data._id);
        if (!isEditing) {
          navigate(`/edit-blog/${response.data._id}`);
        }
        setIsEditing(true);
        setBlog(response.data);
      }
      alert('Auto-save successful.');
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  const handleSaveDraft = async (): Promise<void> => {
    if (!user || (id && blogOwnerId && user._id !== blogOwnerId)) {
      alert('You are not authorized to save this blog.');
      return;
    }
    if (!title) {
      alert('Title is required to save a draft manually.');
      return;
    }
    await saveDraft();
    alert('Draft saved manually!');
  };

  const handlePublish = async (): Promise<void> => {
    if (!user || (id && blogOwnerId && user._id !== blogOwnerId)) {
      alert('You are not authorized to publish this blog.');
      return;
    }
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
        status: 'published' as const,
        imageUrl: imageUrl || undefined,
      };
      let response;
      if (blogId) {
        response = await api.patch<Blog>(`/api/blogs/${blogId}`, blogData);
      } else {
        response = await api.post<Blog>('/api/blogs', blogData);
      }
      alert('Blog published successfully!');
      navigate(`/blogs/${response.data._id}`);
    } catch (err) {
      console.error('Publish failed:', err);
      alert('Failed to publish blog. See console for details.');
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!user || (id && blogOwnerId && user._id !== blogOwnerId)) {
      alert('You are not authorized to delete this blog.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this blog?') && blogId) {
      try {
        await api.delete(`/api/blogs/${blogId}`);
        alert('Blog deleted successfully!');
        navigate('/my-blogs');
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete blog. See console for details.');
      }
    }
  };

  if (loading || authLoading) {
    return <div className="container mx-auto px-4 py-8 text-center"><p>Loading editor...</p></div>;
  }

  if (id && blogOwnerId && user && user._id !== blogOwnerId) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600"><p>You are not authorized to edit this blog.</p></div>;
  }

  const generateBlog = async () => {
    try {
      setGenerating(true);
      const response = await api.post<{ content: string }>("/api/ai/generateBlog", {
        title,
      });
      
      const aiContent = response.data.content;
      setContent(aiContent);
      setGenerating(false);
    } catch (error) {
      setGenerating(false);
      alert("Error generating blog!");
      console.error("AI generation failed:", error);
    }
  };

  return (
    <div className="container mx-auto">

      <div className='min-h-[15vh] text-center bg-[linear-gradient(180deg,#c7ddff_0%,#ffffff_64%)]'>
          <h1 className="text-2xl font-bold mb-6 pt-5">{id ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
      </div>
      <div className='px-8 pb-5'>
        <div className="mb-4 ">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            disabled={!!(id && blogOwnerId && user && user._id !== blogOwnerId)}
          />
        </div>
        <button onClick={generateBlog} className="relative inline-flex items-center justify-center px-6 py-2.5 font-semibold text-white bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl shadow-md transition-all duration-300 ease-out hover:from-blue-500 hover:to-blue-800 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 cursor-pointer my-4">Generate with AI</button>
        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Content:</label>
          {generating? <div className="flex flex-col items-center justify-center gap-3 py-6">
              <div className="w-10 h-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-blue-700 font-semibold text-sm tracking-wide">
                Generating blog with AI… this may take a few seconds
              </p>
            </div>
            :
          <ReactQuill
            value={content}
            onChange={setContent}
            className="h-64 mb-12"
            readOnly={!!(id && blogOwnerId && user && user._id !== blogOwnerId)}
          />
          }
        </div>
        <div className="mb-4 mt-12">
          <label htmlFor="tags" className="block text-gray-700 text-sm font-bold mb-2">Tags (comma-separated):</label>
          <input
            type="text"
            id="tags"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={tags}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
            disabled={!!(id && blogOwnerId && user && user._id !== blogOwnerId)}
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
        {!(id && blogOwnerId && user && user._id !== blogOwnerId) && (
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
            {id && (
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
    </div>
  );
};

export default BlogEditor;

