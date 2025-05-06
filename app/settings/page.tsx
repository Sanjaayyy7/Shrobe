"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, Save } from "lucide-react"
import Header from "@/components/feed/header"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    biography: ""
  })
  const [originalUsername, setOriginalUsername] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [checkingUsername, setCheckingUsername] = useState(false)
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        
        // Get session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error checking settings auth:", error)
          router.push("/login")
          return
        }
        
        if (!data?.session?.user) {
          router.push("/login")
          return
        }
        
        // Set user data
        setUser(data.session.user)
        
        console.log("Current user metadata:", data.session.user.user_metadata)
        
        // Get username from metadata or email
        const currentUsername = data.session.user.user_metadata?.user_name || data.session.user.email?.split('@')[0] || ""
        setOriginalUsername(currentUsername)
        
        // Initialize form with user data
        setFormData({
          fullName: data.session.user.user_metadata?.full_name || "",
          username: currentUsername,
          email: data.session.user.email || "",
          biography: data.session.user.user_metadata?.biography || ""
        })
        
      } catch (error) {
        console.error("Settings page error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
    
    // Escuchar eventos de actualización de perfil
    const handleProfileUpdate = (event: any) => {
      if (event.detail) {
        setFormData(prev => ({
          ...prev,
          fullName: event.detail.fullName || prev.fullName,
          username: event.detail.username || prev.username,
          email: event.detail.email || prev.email,
          biography: event.detail.biography || prev.biography
        }))
      }
    }
    
    window.addEventListener('userProfileUpdated', handleProfileUpdate as EventListener)
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate as EventListener)
    }
  }, [router, supabase])

  // Check if username exists
  const checkUsernameExists = async (username: string) => {
    if (username === originalUsername) {
      setUsernameError("")
      return false
    }
    
    setCheckingUsername(true)
    
    try {
      // Check if username exists in User table
      const { data: existingUsers, error } = await supabase
        .from('user')
        .select('user_name')
        .eq('user_name', username)
        .limit(1)
      
      if (error) {
        console.error("Error checking username:", error)
        setUsernameError("Could not verify username availability")
        return true
      }
      
      // If we found a user with this username
      if (existingUsers && existingUsers.length > 0) {
        setUsernameError("This username is already taken")
        return true
      }
      
      // Username is available
      setUsernameError("")
      return false
    } catch (err) {
      console.error("Exception during username check:", err)
      setUsernameError("Could not verify username availability")
      return true
    } finally {
      setCheckingUsername(false)
    }
  }

  // Función de utilidad para retrasos
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear any previous success/error messages when form is modified
    setSaveSuccess(false)
    setSaveError("")
    
    // Check username availability when it changes
    if (name === 'username' && value.trim() !== originalUsername) {
      // Basic validation for username format
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        setUsernameError("Username can only contain letters, numbers, and underscores")
      } else {
        setUsernameError("")
        
        // Only check with the database if it passes basic validation
        // Use debounce to avoid too many checks while typing
        const timeoutId = setTimeout(() => {
          checkUsernameExists(value)
        }, 500)
        
        return () => clearTimeout(timeoutId)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess(false)
    setSaveError("")
    
    
    // Final validation checks before save
    if (formData.username.trim() === "") {
      setSaveError("Username cannot be empty")
      setSaving(false)
      return
    }
    
    // Check if username format is valid
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setSaveError("Username can only contain letters, numbers, and underscores")
      setSaving(false)
      return
    }
    
    // Check if username exists (only if it has changed)
    if (formData.username !== originalUsername) {
      const usernameExists = await checkUsernameExists(formData.username)
      if (usernameExists) {
        setSaveError("This username is already taken. Please choose another one.")
        setSaving(false)
        return
      }
    }
    
    try {
      console.log("Updating user profile with:", {
        full_name: formData.fullName,
        user_name: formData.username,
        biography: formData.biography
      })
      
      // 1. Actualizar metadatos de usuario en Supabase Auth
      let response;
      let maxRetries = 3;
      let retryDelay = 1000;
      
      // Intentar actualizar los metadatos con reintento manual para el rate limit
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        response = await supabase.auth.updateUser({
          data: {
            full_name: formData.fullName,
            user_name: formData.username,
            biography: formData.biography
          }
        });
        
        // Si no hay error o si el error no es de rate limit, salimos del bucle
        if (!response.error || !response.error.message?.includes('rate limit')) {
          break;
        }
        
        // Si llegamos aquí, hubo un error de rate limit, esperamos y reintentamos
        console.log(`Rate limit hit, retrying (${attempt + 1}/${maxRetries})...`);
        const delay = retryDelay * Math.pow(2, attempt) * (0.75 + Math.random() * 0.5);
        await sleep(delay);
      }
      
      // Verificar el resultado final
      const { data, error } = response || { data: null, error: null };
      
      if (error) {
        console.error("Error updating auth user metadata:", error)
        
        // Check if the error is related to username being taken
        if (error.message && error.message.includes("username")) {
          setSaveError("This username is already taken. Please choose another one.")
        } else if (error.message && error.message.includes("rate limit")) {
          setSaveError("Server is busy. Please wait a moment and try again.")
        } else {
          setSaveError(error.message || "Failed to update profile. Please try again.")
        }
        setSaving(false)
        return
      }
      
      console.log("Auth metadata updated successfully:", data)
      
      // 2. Actualizar en la tabla User
      if (!user || !user.id) {
        console.error("User session not available — cannot update user record")
        setSaveError("User session not available. Please reload and try again.")
        setSaving(false)
        return
      }

      // Verificar primero si el usuario existe en la tabla
      let existingUser = null;
      try {
        const { data: userData, error: fetchError } = await supabase
          .from('User')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (fetchError) {
          console.error("Error fetching existing user record:", fetchError);
          
          // Si el error es "No rows found", significa que el usuario no existe y debemos crearlo
          if (fetchError.message?.includes('No rows found')) {
            console.log("No user record found, will create a new one");
            // No hacemos return, continuamos con la creación del usuario
          } else {
            // Para otros errores, intentamos continuar con la operación de upsert
            console.log("Error querying user, will attempt upsert anyway:", fetchError);
          }
        } else {
          existingUser = userData;
          console.log("Existing user record:", existingUser);
        }
      } catch (fetchErr) {
        console.error("Exception while fetching user record:", fetchErr);
        // Continuamos con la actualización, aunque la verificación haya fallado
      }

      // Reintentos para la actualización de la tabla User
      let userRecordResponse;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Preparar los datos del usuario asegurándonos que todos los campos requeridos estén presentes
          const userData: Record<string, any> = {
            id: user.id,
            mail: user.email || "", // Asegurar que mail no esté vacío
            user_name: formData.username,
            full_name: formData.fullName,
            biography: formData.biography
          };
          
          // Si es un usuario nuevo, agregar created_at
          if (!existingUser) {
            userData.created_at = new Date().toISOString();
          }
          
          console.log("Attempting to upsert user data:", userData);
          
          // Usamos .upsert() para asegurarnos de que funcione incluso si el registro no existe
          userRecordResponse = await supabase
            .from('User')
            .upsert(
              userData,
              { 
                onConflict: 'id'
              }
            );
            
          console.log("User record upsert response:", userRecordResponse);
          
          // Si no hay error o si el error no es de rate limit, salimos del bucle
          if (!userRecordResponse.error || !userRecordResponse.error.message?.includes('rate limit')) {
            break;
          }
        } catch (upsertErr) {
          console.error(`Attempt ${attempt + 1} failed with exception:`, upsertErr);
          // Continuamos con el siguiente intento
        }
        
        // Si llegamos aquí, hubo un error de rate limit, esperamos y reintentamos
        console.log(`Rate limit hit on user record update, retrying (${attempt + 1}/${maxRetries})...`);
        const delay = retryDelay * Math.pow(2, attempt) * (0.75 + Math.random() * 0.5);
        await sleep(delay);
      }
      
      // Si el userRecordResponse es undefined después de todos los intentos, creamos un error genérico
      const { error: userRecordError } = userRecordResponse || { error: { message: "Failed to update user record after multiple attempts" } };
      
      if (userRecordError) {
        console.error("Error updating User table:", userRecordError);
        
        // Errores específicos conocidos
        const errorCode = (userRecordError as any).code;
        
        // Username duplicado
        if (errorCode === '23505' && userRecordError.message?.includes('user_name')) {
          setSaveError("This username is already taken in the database. Please choose another one.");
          setSaving(false);
          return;
        }
        
        // Rate limit
        if (userRecordError.message?.includes('rate limit')) {
          setSaveError("Too many requests. Please wait a moment and try again.");
          setSaving(false);
          return;
        }
        
        // Error de permisos o policy
        if (errorCode === '42501' || userRecordError.message?.includes('policy')) {
          setSaveError("You don't have permission to update this user record. This could be due to security restrictions.");
          setSaving(false);
          return;
        }
        
        // Si ya actualizamos los metadatos, intentamos revertir
        try {
          await supabase.auth.updateUser({
            data: {
              full_name: user.user_metadata?.full_name,
              user_name: originalUsername,
              biography: user.user_metadata?.biography
            }
          });
          
          setSaveError("User record update failed. Changes have been reverted. Please try again later.");
        } catch (revertError) {
          console.error("Failed to revert auth metadata after user record update failure:", revertError);
          setSaveError("User record was partially updated but database sync failed. Please reload and try again.");
        }
        
        setSaving(false);
        return;
      }
      
      // 3. Actualizar el estado local y localStorage
      if (data && data.user) {
        setUser(data.user);
        setSaveSuccess(true);
        setOriginalUsername(formData.username);
        
        // Actualizar localStorage con los datos de usuario actualizados
        const localUserData = {
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          biography: formData.biography
        };
        localStorage.setItem('userProfile', JSON.stringify(localUserData));
        
        // 4. Emitir evento para actualizar UI en otros componentes
        const updateEvent = new CustomEvent('userProfileUpdated', {
          detail: {
            fullName: formData.fullName,
            username: formData.username,
            biography: formData.biography
          }
        });
        window.dispatchEvent(updateEvent);
        
        // 5. Mostrar mensaje de éxito
        console.log("User record updated successfully, both auth and User table");
      } else {
        console.error("Missing user data in response");
        setSaveError("User record update was partially successful. Please refresh and try again.");
      }
      
    } catch (err) {
      console.error("Exception during user record update:", err);
      setSaveError("An unexpected error occurred. Please try again later.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Fixed Header */}
      <Header />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <div className="mb-8">
            <Link
              href="/profile"
              className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Profile
            </Link>
          </div>
          
          {/* Settings header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-400 mt-1">Update your profile and preferences</p>
          </div>
          
          {/* Profile settings form */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Success message */}
                {saveSuccess && (
                  <div className="bg-green-900/60 border border-green-500/50 rounded-md p-4 text-green-200">
                    Profile updated successfully!
                  </div>
                )}
                
                {/* Error message */}
                {saveError && (
                  <div className="bg-red-900/60 border border-red-500/50 rounded-md p-4 text-red-200">
                    {saveError}
                  </div>
                )}
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                  />
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                    Username
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-black/60 border border-r-0 border-white/20 rounded-l-lg text-gray-400">
                      @
                    </span>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`flex-1 px-4 py-2.5 bg-black/40 border ${
                        usernameError ? 'border-red-500' : 'border-white/20'
                      } rounded-r-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors`}
                    />
                    {checkingUsername && (
                      <div className="ml-2 flex items-center">
                        <div className="w-4 h-4 border-2 border-t-transparent border-pink-500 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {usernameError && (
                    <p className="mt-1 text-xs text-red-400">{usernameError}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Username can only contain letters, numbers, and underscores.</p>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="biography" className="block text-sm font-medium text-gray-300 mb-1">
                    Biography
                  </label>
                  <textarea
                    id="biography"
                    name="biography"
                    value={formData.biography}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving || usernameError !== ""}
                    className="w-full flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Account settings */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-gray-400">Manage your email notifications</p>
                </div>
                <Link
                  href="/settings/notifications"
                  className="text-sm font-medium text-pink-500 hover:text-pink-400 transition-colors"
                >
                  Manage
                </Link>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-gray-400">Update your password</p>
                </div>
                <Link
                  href="/settings/password"
                  className="text-sm font-medium text-pink-500 hover:text-pink-400 transition-colors"
                >
                  Update
                </Link>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium text-red-500">Delete Account</h3>
                  <p className="text-sm text-gray-400">Permanently delete your account</p>
                </div>
                <button
                  className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 