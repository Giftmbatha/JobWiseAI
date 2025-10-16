import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Button,
  TextField,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  Fade,
  Slide,
  Collapse,
  Card,
  CardContent
} from '@mui/material';
import { 
  Edit, 
  CameraAlt, 
  Delete, 
  Save, 
  Cancel, 
  Email, 
  Business,
  LocationOn,
  Phone,
  Work,
  School,
  Code,
  TrendingUp,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import profileAPI from '../api/profile';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    headline: user?.headline || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    experience_level: user?.experience_level || '',
    education: user?.education || []
  });
  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const updatedUser = await profileAPI.updateProfile(formData);
      updateUser(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setEditDialogOpen(false);
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setAvatarLoading(true);
    try {
      const updatedUser = await profileAPI.uploadAvatar(file);
      updateUser(updatedUser);
      setMessage({ type: 'success', text: 'Avatar updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
    } finally {
      setAvatarLoading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleDeleteAvatar = async () => {
    setAvatarLoading(true);
    try {
      const updatedUser = await profileAPI.deleteAvatar();
      updateUser(updatedUser);
      setMessage({ type: 'success', text: 'Avatar removed successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove avatar' });
    } finally {
      setAvatarLoading(false);
    }
  };

  const experienceLevels = [
    'Entry Level',
    'Junior',
    'Mid Level',
    'Senior',
    'Lead',
    'Executive'
  ];

  const openEditDialog = () => {
    setFormData({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      location: user?.location || '',
      headline: user?.headline || '',
      bio: user?.bio || '',
      skills: user?.skills || [],
      experience_level: user?.experience_level || '',
      education: user?.education || []
    });
    setEditDialogOpen(true);
    setMessage({ type: '', text: '' });
  };

  if (!user) return null;

  return (
    <div>
      {/* Compact Profile View for Dashboard Header */}
      <Fade in={true} timeout={500}>
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1.5,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.15)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              transform: 'translateY(-1px)'
            }
          }}
          onClick={() => setExpanded(!expanded)}
        >
          {/* Avatar */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user.profile_pic_url}
              sx={{ 
                width: 44, 
                height: 44,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              {user.full_name?.charAt(0) || user.email?.charAt(0)}
            </Avatar>
            
            {/* Edit Icon Badge */}
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                openEditDialog();
              }}
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                backgroundColor: '#FAF5EE',
                color: '#1D503A',
                width: 20,
                height: 20,
                '&:hover': {
                  backgroundColor: '#e8e0d5',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease',
                '& .MuiSvgIcon-root': {
                  fontSize: '0.75rem'
                }
              }}
            >
              <Edit />
            </IconButton>
          </Box>

          {/* User Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#FAF5EE',
                fontWeight: 600,
                lineHeight: 1.2,
                mb: 0.5
              }}
              noWrap
            >
              {user.full_name || 'No Name Set'}
            </Typography>
            
            {user.headline && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: 1.2,
                  display: 'block'
                }}
                noWrap
              >
                {user.headline}
              </Typography>
            )}
          </Box>

          {/* Expand Icon */}
          <IconButton 
            size="small"
            sx={{ 
              color: '#FAF5EE',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Fade>

      {/* Expanded Profile View */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Fade in={expanded} timeout={500}>
          <Card 
            sx={{ 
              mt: 1,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <CardContent sx={{ p: 2 }}>
              {/* Enhanced Avatar Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={user.profile_pic_url}
                    sx={{ 
                      width: 60, 
                      height: 60,
                      border: '3px solid #1D503A',
                      boxShadow: '0 4px 12px rgba(29, 80, 58, 0.3)'
                    }}
                  >
                    {user.full_name?.charAt(0) || user.email?.charAt(0)}
                  </Avatar>
                  
                  {/* Camera Icon for Avatar Upload */}
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload-compact"
                    type="file"
                    onChange={handleAvatarUpload}
                  />
                  <label htmlFor="avatar-upload-compact">
                    <IconButton 
                      component="span" 
                      disabled={avatarLoading}
                      sx={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        backgroundColor: '#1D503A',
                        color: 'white',
                        width: 24,
                        height: 24,
                        '&:hover': {
                          backgroundColor: '#16412e',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.3s ease',
                        '& .MuiSvgIcon-root': {
                          fontSize: '0.875rem'
                        }
                      }}
                    >
                      <CameraAlt />
                    </IconButton>
                  </label>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#1D503A', 
                      fontWeight: 600,
                      mb: 0.5
                    }}
                  >
                    {user.full_name || 'No Name Set'}
                  </Typography>
                  
                  <Chip 
                    icon={<Work sx={{ fontSize: 14 }} />}
                    label={user.role} 
                    size="small"
                    sx={{ 
                      backgroundColor: alpha('#1D503A', 0.1),
                      color: '#1D503A',
                      fontWeight: 500,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              </Box>

              {/* Contact Info */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Email sx={{ color: '#1D503A', fontSize: 16 }} />
                  <Typography variant="body2" sx={{ color: '#484848', fontWeight: 500 }}>
                    {user.email}
                  </Typography>
                </Box>

                {user.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Phone sx={{ color: '#1D503A', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#484848', fontWeight: 500 }}>
                      {user.phone}
                    </Typography>
                  </Box>
                )}

                {user.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn sx={{ color: '#1D503A', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#484848', fontWeight: 500 }}>
                      {user.location}
                    </Typography>
                  </Box>
                )}

                {user.experience_level && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp sx={{ color: '#1D503A', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#484848', fontWeight: 500 }}>
                      {user.experience_level}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Skills Preview */}
              {user.skills && user.skills.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: '#1D503A', 
                      fontWeight: 600, 
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <Code sx={{ fontSize: 16 }} />
                    Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {user.skills.slice(0, 4).map((skill, index) => (
                      <Chip 
                        key={index} 
                        label={skill} 
                        size="small"
                        sx={{ 
                          backgroundColor: alpha('#1D503A', 0.1),
                          color: '#1D503A',
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          height: 24
                        }}
                      />
                    ))}
                    {user.skills.length > 4 && (
                      <Chip 
                        label={`+${user.skills.length - 4}`} 
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderColor: '#1D503A', 
                          color: '#1D503A',
                          fontSize: '0.7rem',
                          height: 24
                        }}
                      />
                    )}
                  </Box>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={openEditDialog}
                  size="small"
                  sx={{
                    backgroundColor: '#1D503A',
                    '&:hover': { 
                      backgroundColor: '#16412e',
                      transform: 'translateY(-1px)'
                    },
                    flex: 1,
                    fontSize: '0.75rem',
                    py: 0.5,
                    borderRadius: 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Collapse>

      {/* Enhanced Edit Profile Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => !loading && setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
            color: 'white',
            py: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Edit Profile
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            Update your professional information
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {/* Message Alert */}
          {message.text && (
            <Alert 
              severity={message.type} 
              sx={{ 
                mb: 2,
                borderRadius: 1,
              }}
            >
              {message.text}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1D503A', fontWeight: 600 }}>
                Basic Information
              </Typography>
              
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                margin="normal"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '&:hover fieldset': {
                      borderColor: '#1D503A',
                    },
                  }
                }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              />
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                margin="normal"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              />
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Experience Level</InputLabel>
                <Select
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleInputChange}
                  label="Experience Level"
                  sx={{ borderRadius: 1 }}
                >
                  {experienceLevels.map(level => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Professional Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1D503A', fontWeight: 600 }}>
                Professional Information
              </Typography>
              
              <TextField
                fullWidth
                label="Professional Headline"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                margin="normal"
                size="small"
                placeholder="e.g., Senior Software Engineer"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              />
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                margin="normal"
                size="small"
                multiline
                rows={3}
                placeholder="Tell us about your professional background..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              />
            </Grid>

            {/* Skills Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" gutterBottom sx={{ color: '#1D503A', fontWeight: 600 }}>
                Skills & Technologies
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-start' }}>
                  <TextField
                    size="small"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    sx={{ flex: 1 }}
                  />
                  <Button 
                    onClick={handleAddSkill} 
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: '#1D503A',
                      '&:hover': { backgroundColor: '#16412e' },
                      px: 2,
                      borderRadius: 1
                    }}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {formData.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      onDelete={() => handleRemoveSkill(skill)}
                      size="small"
                      sx={{
                        borderRadius: 1,
                        borderColor: '#1D503A',
                        color: '#1D503A',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            variant="outlined"
            disabled={loading}
            startIcon={<Cancel />}
            size="small"
            sx={{ 
              borderRadius: 1,
              px: 2,
              borderColor: '#1D503A',
              color: '#1D503A',
              '&:hover': {
                borderColor: '#16412e',
                backgroundColor: 'rgba(29, 80, 58, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile} 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Save />}
            size="small"
            sx={{ 
              backgroundColor: '#1D503A', 
              '&:hover': { backgroundColor: '#16412e' },
              px: 3,
              borderRadius: 1,
              fontWeight: 600,
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserProfile;