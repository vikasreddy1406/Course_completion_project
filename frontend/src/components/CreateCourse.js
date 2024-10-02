// import React, { useState } from 'react';
// import axios from 'axios';
// import Cookie from 'js-cookie';
// import { Button, TextInput, Label } from 'flowbite-react';
// import { useNavigate } from 'react-router-dom';
// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// const CreateCourse = () => {
//   const [newCourse, setNewCourse] = useState({ title: '', description: '', tag: '' });
//   const [modules, setModules] = useState([]); // Store modules for the new course
//   const [moduleTitle, setModuleTitle] = useState('');
//   const [moduleContent, setModuleContent] = useState('');
//   const [moduleDuration, setModuleDuration] = useState('');
//   const [courseCreated, setCourseCreated] = useState(false);
//   const [courseId, setCourseId] = useState(null); // Store the course ID
//   const navigate = useNavigate();

//   // Handle course creation
//   const handleCreateCourse = async () => {
//     try {
//       const response = await axios.post('http://localhost:4000/api/admin/create-courses', newCourse, {
//         headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
//       });
//       setCourseId(response.data.course._id); // Store the course ID
//       setCourseCreated(true); // Mark the course as created
//     } catch (error) {
//       console.error('Error creating course:', error);
//     }
//   };

//   // Handle module addition
//   const handleAddModule = async () => {
//     if (moduleTitle && moduleContent && moduleDuration && courseId) {
//       const newModule = { module_title: moduleTitle, module_content: moduleContent, module_duration: moduleDuration };

//       try {
//         const response = await axios.post(`http://localhost:4000/api/admin/courses/${courseId}/add-modules`, newModule, {
//           headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
//         });
//         setModules([...modules, response.data.module]); // Update local modules state
//         setModuleTitle('');
//         setModuleContent('');
//         setModuleDuration('');
//       } catch (error) {
//         console.error('Error adding module:', error);
//       }
//     }
//   };

//   const handleSaveClick = async () => {
//     try {
//       await axios.put(`http://localhost:4000/api/admin/courses/${courseId}/update-details`, {}, {
//         headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
//       });
//       alert('Course details updated successfully');
//     } catch (error) {
//       console.error('Error updating course details:', error);
//     }
//     navigate('/admin');
//   };

//   return (
//     <div className="p-5">
//       <h1 className="text-3xl font-bold mb-5">Create a New Course</h1>

//       <div>
//         <Label>Course Title</Label>
//         <TextInput
//           value={newCourse.title}
//           onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
//           disabled={courseCreated} // Disable after course creation
//         />

//         <Label>Course Description</Label>
//         <CKEditor
//           editor={ClassicEditor}
//           data={newCourse.description}
//           onChange={(event, editor) => {
//             const data = editor.getData();
//             setNewCourse({ ...newCourse, description: data });
//           }}
//           disabled={courseCreated} // Disable after course creation
//         />

//         <Label>Tag</Label>
//         <select
//           value={newCourse.tag}
//           onChange={(e) => setNewCourse({ ...newCourse, tag: e.target.value })}
//           className="border rounded p-2 mt-1 w-full"
//           disabled={courseCreated} // Disable after course creation
//         >
//           <option value="">Select a tag</option>
//           <option value="Web Development">Web Development</option>
//           <option value="Data Engineering">Data Engineering</option>
//           <option value="Data Science">Data Science</option>
//           <option value="Generative AI">Generative AI</option>
//           <option value="DevOps">DevOps</option>
//           <option value="Cybersecurity">Cybersecurity</option>
//           <option value="Mobile Development">Mobile Development</option>
//           <option value="UI/UX Design">UI/UX Design</option>
//           <option value="Software Testing">Software Testing</option>
//         </select>
//       </div>

//       <Button onClick={handleCreateCourse} className="text-black" disabled={courseCreated}>
//         Create Course
//       </Button>

//       {courseCreated && (
//         <div className="mt-5">
//           <h3 className="text-2xl">Add Modules</h3>

//           <div>
//             <Label>Module Title</Label>
//             <TextInput
//               value={moduleTitle}
//               onChange={(e) => setModuleTitle(e.target.value)}
//             />

//             <Label>Module Content</Label>
//             <CKEditor
//               editor={ClassicEditor}
//               data={moduleContent}
//               onChange={(event, editor) => {
//                 const data = editor.getData();
//                 setModuleContent(data);
//               }}
//             />

//             <Label>Duration</Label>
//             <TextInput
//               value={moduleDuration}
//               onChange={(e) => setModuleDuration(e.target.value)}
//             />
//           </div>

//           <Button onClick={handleAddModule} className="text-black">
//             Add Module
//           </Button>
//           <ul className="mt-2">
//             {modules.map((module, index) => (
//               <li key={index}>{module.module_title} - {module.module_duration}hrs</li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <Button onClick={handleSaveClick} className="mt-5 text-black">
//         Save
//       </Button>
//       <Button onClick={() => navigate('/admin')} className="mt-5 text-black">
//         Back to Admin Home
//       </Button>
//     </div>
//   );
// };

// export default CreateCourse;

import React, { useState } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { Button, TextInput, Label } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const CreateCourse = () => {
  const [newCourse, setNewCourse] = useState({ title: '', description: '', tag: '' });
  const [image, setImage] = useState(null); // State to store the image file
  const [modules, setModules] = useState([]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleContent, setModuleContent] = useState('');
  const [moduleDuration, setModuleDuration] = useState('');
  const [courseCreated, setCourseCreated] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const navigate = useNavigate();

  // Handle image upload
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle course creation
  const handleCreateCourse = async () => {
    const formData = new FormData();
    formData.append('title', newCourse.title);
    formData.append('description', newCourse.description);
    formData.append('tag', newCourse.tag);
    if (image) {
      formData.append('image', image); // Append the image to the form data
    }

    try {
      const response = await axios.post('http://localhost:4000/api/admin/create-courses', formData, {
        headers: {
          Authorization: `Bearer ${Cookie.get('accessToken')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setCourseId(response.data.course._id);
      setCourseCreated(true);
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

    const handleAddModule = async () => {
      if (moduleTitle && moduleContent && moduleDuration && courseId) {
        const newModule = { module_title: moduleTitle, module_content: moduleContent, module_duration: moduleDuration };

        try {
          const response = await axios.post(`http://localhost:4000/api/admin/courses/${courseId}/add-modules`, newModule, {
            headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
          });
          setModules([...modules, response.data.module]); // Update local modules state
          setModuleTitle('');
          setModuleContent('');
          setModuleDuration('');
        } catch (error) {
          console.error('Error adding module:', error);
        }
      }
    };

    const handleSaveClick = async () => {
      try {
        await axios.put(`http://localhost:4000/api/admin/courses/${courseId}/update-details`, {}, {
          headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        });
        alert('Course details updated successfully');
      } catch (error) {
        console.error('Error updating course details:', error);
      }
      navigate('/admin');
    };


  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-5">Create a New Course</h1>

      <div>
        <Label>Course Title</Label>
        <TextInput
          value={newCourse.title}
          onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
          disabled={courseCreated}
        />

        <Label>Course Description</Label>
        <CKEditor
          editor={ClassicEditor}
          data={newCourse.description}
          onChange={(event, editor) => {
            const data = editor.getData();
            setNewCourse({ ...newCourse, description: data });
          }}
          disabled={courseCreated}
        />

        <Label>Tag</Label>
        <select
          value={newCourse.tag}
          onChange={(e) => setNewCourse({ ...newCourse, tag: e.target.value })}
          className="border rounded p-2 mt-1 w-full"
          disabled={courseCreated}
        >
          <option value="">Select a tag</option>
          <option value="Web Development">Web Development</option>
          <option value="Data Engineering">Data Engineering</option>
          <option value="Data Science">Data Science</option>
          <option value="Generative AI">Generative AI</option>
          <option value="DevOps">DevOps</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="Mobile Development">Mobile Development</option>
          <option value="UI/UX Design">UI/UX Design</option>
          <option value="Software Testing">Software Testing</option>
        </select>

        <Label>Upload Course Image</Label>
        <input type="file" onChange={handleImageChange} disabled={courseCreated} />

      </div>

      <Button onClick={handleCreateCourse} className="text-black" disabled={courseCreated}>
        Create Course
      </Button>

      {courseCreated && (
        <div className="mt-5">
          <h3 className="text-2xl">Add Modules</h3>

          <div>
            <Label>Module Title</Label>
            <TextInput
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
            />

            <Label>Module Content</Label>
            <CKEditor
              editor={ClassicEditor}
              data={moduleContent}
              onChange={(event, editor) => {
                const data = editor.getData();
                setModuleContent(data);
              }}
            />

            <Label>Duration</Label>
            <TextInput
              value={moduleDuration}
              onChange={(e) => setModuleDuration(e.target.value)}
            />
          </div>

          <Button onClick={handleAddModule} className="text-black">
            Add Module
          </Button>
          <ul className="mt-2">
            {modules.map((module, index) => (
              <li key={index}>{module.module_title} - {module.module_duration}hrs</li>
            ))}
          </ul>
        </div>
      )}

      <Button onClick={handleSaveClick} className="mt-5 text-black">
        Save
      </Button>
      <Button onClick={() => navigate('/admin')} className="mt-5 text-black">
        Back to Admin Home
      </Button>
      
    </div>
  );
};

export default CreateCourse;
