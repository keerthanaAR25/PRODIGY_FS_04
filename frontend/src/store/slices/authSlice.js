import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data)
    localStorage.setItem('token', res.data.token)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Registration failed')
  }
})

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data)
    localStorage.setItem('token', res.data.token)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed')
  }
})

export const adminLogin = createAsyncThunk('auth/adminLogin', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/admin/login', data)
    localStorage.setItem('token', res.data.token)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Admin login failed')
  }
})

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me')
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to get user')
  }
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/users/profile', data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Update failed')
  }
})

export const uploadAvatar = createAsyncThunk('auth/uploadAvatar', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Upload failed')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
    initialized: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
    },
    clearError: (state) => { state.error = null },
    updateUserStatus: (state, action) => {
      if (state.user) state.user.status = action.payload
    },
    setUser: (state, action) => { state.user = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user; state.token = action.payload.token
      })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user; state.token = action.payload.token
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(adminLogin.pending, (state) => { state.loading = true; state.error = null })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user; state.token = action.payload.token
      })
      .addCase(adminLogin.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(getMe.pending, (state) => { state.loading = true })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user; state.initialized = true
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false; state.token = null; state.initialized = true; localStorage.removeItem('token')
      })
      .addCase(updateProfile.fulfilled, (state, action) => { state.user = action.payload.user })
      .addCase(uploadAvatar.fulfilled, (state, action) => { if (state.user) state.user = action.payload.user })
  },
})

export const { logout, clearError, updateUserStatus, setUser } = authSlice.actions
export default authSlice.reducer