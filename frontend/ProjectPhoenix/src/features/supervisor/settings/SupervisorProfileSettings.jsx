import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, updateUserPhoto, updateUserProfile } from "@/features/auth/authSlice";
import {
  useGetSupervisorProfileQuery,
  useUpdateSupervisorProfileMutation,
  useUpdateSupervisorPhotoMutation,
  useRequestSupervisorPasswordChangeOTPMutation,
  useChangeSupervisorPasswordWithOTPMutation,
} from "../supervisorApiSlice";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, Save, Eye, EyeOff, User, Shield, Image as ImageIcon } from "lucide-react";
import { getInitials } from "@/lib/utils";

const SupervisorProfileSettings = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Debug logging
  console.log("🔍 SupervisorProfileSettings rendered");
  console.log("🔍 Current user:", user);
  console.log("🔍 User ID:", user?._id);

  // Form states
  const [profileData, setProfileData] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    designation: "",
    institution: "",
    skillSet: [],
    photo: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [otpData, setOtpData] = useState({
    otp: "",
    showOtpStep: false,
    email: "",
  });

  // API hooks
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetSupervisorProfileQuery(user?._id);
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateSupervisorProfileMutation();
  const [updatePhoto, { isLoading: updatingPhoto }] = useUpdateSupervisorPhotoMutation();
  const [requestPasswordOTP, { isLoading: requestingOTP }] = useRequestSupervisorPasswordChangeOTPMutation();
  const [changePassword, { isLoading: changingPassword }] = useChangeSupervisorPasswordWithOTPMutation();

  // Debug API state
  console.log("Profile API state:", { profile, profileLoading, profileError });

  // Initialize profile data when profile is loaded
  React.useEffect(() => {
    if (profile?.data) {
      setProfileData({
        fullname: profile.data.fullname || "",
        email: profile.data.email || "",
        phoneNumber: profile.data.phoneNumber || "",
        designation: profile.data.designation || "",
        institution: profile.data.institution || "",
        skillSet: profile.data.skillSet || [],
        photo: profile.data.photo || "",
      });
    }
  }, [profile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Debug: Log the skillSet array being sent
    console.log("🔍 Updating profile with skillSet:", profileData.skillSet);
    console.log("🔍 Selected skills count:", profileData.skillSet.length);
    console.log("🔍 Selected skills:", profileData.skillSet);
    
    try {
      const result = await updateProfile({
        id: user._id,
        data: profileData,
      }).unwrap();

      if (result.success) {
        toast({
          title: "Profile Updated!",
          description: "Your profile has been updated successfully.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        
        // Update the global user state to sync with dashboard and other components
        if (result.data) {
          dispatch(updateUserProfile({
            fullname: result.data.fullname,
            email: result.data.email,
            phoneNumber: result.data.phoneNumber,
            designation: result.data.designation,
            institution: result.data.institution,
            skillSet: result.data.skillSet,
            photo: result.data.photo,
          }));
        }
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: error?.data?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpdate = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      console.log("🔄 Starting photo update...");
      console.log("📁 File:", file);
      console.log("🆔 User ID:", user._id);

      const result = await updatePhoto({
        id: user._id,
        data: formData,
      }).unwrap();

      console.log("✅ Photo update result:", result);

      if (result.success) {
        toast({
          title: "Photo Updated!",
          description: "Your profile photo has been updated successfully.",
          className: "bg-green-50 border-green-200 text-green-800",
        });

        // Update the global user state
        if (result.data?.photo) {
          console.log("🖼️ Updating UI with photo:", result.data.photo);
          
          // Update Redux state for immediate UI update
          dispatch(updateUserPhoto({ photo: result.data.photo }));
          
          // Update local profile state to trigger re-render
          setProfileData(prev => ({
            ...prev,
            photo: result.data.photo
          }));
          
          // Also update the user profile in Redux for consistency
          dispatch(updateUserProfile({
            photo: result.data.photo
          }));
          
          console.log("✅ Photo state updated successfully in all stores");
        } else {
          console.warn("⚠️ No photo URL in response data:", result.data);
        }
      }
    } catch (error) {
      console.error("❌ Photo update error:", error);
      toast({
        title: "Photo Update Failed",
        description: error?.data?.message || "Failed to update photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Enhanced debug logging for OTP validation
    console.log("🔍 ===== OTP VALIDATION DEBUG =====");
    console.log("🔍 Form submitted - OTP data:", otpData.otp);
    console.log("🔍 OTP type:", typeof otpData.otp);
    console.log("🔍 OTP length:", otpData.otp?.length);
    console.log("🔍 OTP exists check:", !!otpData.otp); 
    console.log("🔍 OTP length check:", otpData.otp?.length === 6);
    console.log("🔍 OTP data length:", otpData.otp?.length);
    console.log("🔍 Full otpData object:", otpData);
    console.log("🔍 ===== OTP VALIDATION DEBUG END =====");
    
    // CRITICAL: Check if OTP is actually valid
    const isOtpValid = otpData.otp && otpData.otp.length === 6;
    console.log("🔍 CRITICAL: isOtpValid =", isOtpValid);
    console.log("🔍 CRITICAL: otpData.otp =", JSON.stringify(otpData.otp));
    
    if (!isOtpValid) {
      console.log("❌ OTP validation failed");
      console.log("❌ Reason: !otpData.otp =", !otpData.otp);
      console.log("❌ Reason: otpData.otp.length !== 6 =", otpData.otp?.length !== 6);
      console.log("❌ CRITICAL: Final validation result =", isOtpValid);
      
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: `Please enter a valid 6-digit OTP. Current OTP: "${otpData.otp}" (length: ${otpData.otp?.length})`,
      });
      return;
    }
    
    console.log("✅ OTP validation passed");

    try {
      console.log("🔍 ===== DETAILED DEBUG BEFORE API CALL =====");
      console.log("🔍 otpData.otp:", otpData.otp);
      console.log("🔍 otpData.otp type:", typeof otpData.otp);
      console.log("🔍 otpData.otp length:", otpData.otp?.length);
      console.log("🔍 passwordData.newPassword:", passwordData.newPassword);
      console.log("🔍 passwordData.newPassword type:", typeof passwordData.newPassword);
      console.log("🔍 passwordData.newPassword length:", passwordData.newPassword?.length);
      console.log("🔍 user._id:", user._id);
      console.log("🔍 user._id type:", typeof user._id);
      console.log("🔍 ===== END DEBUG =====");
      
      const result = await changePassword({
        id: user._id,
        otp: otpData.otp,
        newPassword: passwordData.newPassword,
      }).unwrap();

      console.log('result:', result);
      if (result.success) {
        toast({
          title: "Password Changed!",
          description: "Your password has been changed successfully.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        
        // Reset all password-related state
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setOtpData({
          otp: "",
          showOtpStep: false,
          email: "",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: error?.data?.message || "Failed to change password. Please try again.",
      });
    }
  };

  const handleRequestPasswordOTP = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await requestPasswordOTP({
        id: user._id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      }).unwrap();

      if (result.success) {
        toast({
          title: "OTP Sent!",
          description: `OTP has been sent to ${result.data.email}. Please check your email.`,
          className: "bg-green-50 border-green-200 text-green-800",
        });
        
        // Show OTP input step
        console.log("🔍 Setting OTP step with email:", result.data.email);
        
        setOtpData({
          otp: "",
          showOtpStep: true,
          email: result.data.email,
        });
        
        console.log("🔍 OTP step state updated");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "OTP Request Failed",
        description: error?.data?.message || "Failed to send OTP. Please try again.",
      });
    }
  };

  // Reset password change flow
  const handleResetPasswordFlow = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setOtpData({
      otp: "",
      showOtpStep: false,
      email: "",
    });
  };

  const handleSkillSetChange = (skill) => {
    setProfileData(prev => {
      const newSkillSet = prev.skillSet.includes(skill)
        ? prev.skillSet.filter(s => s !== skill)  // Remove skill if already selected
        : [...prev.skillSet, skill];              // Add skill if not selected
      
      // Debug: Log skill selection changes
      console.log("🔍 Skill clicked:", skill);
      console.log("🔍 Was selected:", prev.skillSet.includes(skill));
      console.log("🔍 New skillSet:", newSkillSet);
      console.log("🔍 New skillSet length:", newSkillSet.length);
      
      return {
        ...prev,
        skillSet: newSkillSet,
      };
    });
  };

  const availableSkills = [
    "Web Development", "Web Dev", "Mobile Development", "Mobile Dev", "AI/ML", "Data Science", 
    "Database", "Cloud Computing", "Cybersecurity", "DevOps",
    "UI/UX Design", "Software Engineering", "Network Security", "IoT",
    "SQL/NoSQL", "NLP", "Education"
  ];

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">Failed to load your profile. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your supervisor profile and account settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="photo">Photo</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal information and professional details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      value={profileData.fullname}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullname: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={profileData.designation}
                      onChange={(e) => setProfileData(prev => ({ ...prev, designation: e.target.value }))}
                      placeholder="e.g., Assistant Professor"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      value={profileData.institution}
                      onChange={(e) => setProfileData(prev => ({ ...prev, institution: e.target.value }))}
                      placeholder="e.g., NCIT"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Skills & Expertise</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableSkills.map((skill) => {
                      const isHighlighted = profileData.skillSet.includes(skill);
                      return (
                        <Badge
                          key={skill}
                          variant="outline"
                          className={`cursor-pointer transition-colors ${
                            isHighlighted
                              ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-700"
                              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                          }`}
                          onClick={() => handleSkillSetChange(skill)}
                        >
                          {skill}
                        </Badge>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-500">Click on skills to add/remove them from your profile</p>
                </div>

                <Button type="submit" disabled={updatingProfile} className="w-full">
                  {updatingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Profile
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

                {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                {otpData.showOtpStep 
                  ? `Enter the OTP sent to ${otpData.email} to complete password change`
                  : "Update your password to keep your account secure. An OTP will be sent to your email for verification."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!otpData.showOtpStep ? (
                // Step 1: Request OTP
                <form onSubmit={handleRequestPasswordOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter your current password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter your new password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">
                        Password must be at least 8 characters long with uppercase, lowercase, number, and special character
                      </p>
                      
                      {/* Password Strength Indicator */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Strength:</span>
                          <div className="flex gap-1">
                            {[
                              passwordData.newPassword.length >= 8,
                              /[a-z]/.test(passwordData.newPassword),
                              /[A-Z]/.test(passwordData.newPassword),
                              /\d/.test(passwordData.newPassword),
                              /[@$!%*?&]/.test(passwordData.newPassword)
                            ].map((requirement, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                  requirement ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {passwordData.newPassword.length > 0 && (
                            <span>
                              {[
                                passwordData.newPassword.length >= 8 && '✓ Length',
                                /[a-z]/.test(passwordData.newPassword) && '✓ Lowercase',
                                /[A-Z]/.test(passwordData.newPassword) && '✓ Uppercase',
                                /\d/.test(passwordData.newPassword) && '✓ Number',
                                /[@$!%*?&]/.test(passwordData.newPassword) && '✓ Special'
                              ].filter(Boolean).join(' • ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm your new password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleResetPasswordFlow}
                    >
                      Reset
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={requestingOTP}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {requestingOTP ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Send OTP
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                // Step 2: Enter OTP
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Shield className="h-5 w-5" />
                      <span className="font-medium">OTP Verification Required</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      We've sent a 6-digit OTP to <strong>{otpData.email}</strong>. 
                      Please check your email and enter the OTP below.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otpData.otp}
                      onChange={(e) => {
                        // Only allow numbers and ensure OTP is always a string
                        const inputValue = e.target.value;
                        const numericValue = inputValue.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                        const otpValue = String(numericValue);
                        
                        console.log("🔍 OTP Input Change:", otpValue);
                        console.log("🔍 OTP Type:", typeof otpValue);
                        console.log("🔍 OTP Length:", otpValue.length);
                        
                        setOtpData({ ...otpData, otp: otpValue });
                      }}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      className="text-center text-lg tracking-widest"
                      required
                    />
                    <p className="text-xs text-gray-500 text-center">
                      Enter the 6-digit OTP from your email
                    </p>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleResetPasswordFlow}
                    >
                      Start Over
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={changingPassword}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {changingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photo Tab */}
        <TabsContent value="photo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Profile Photo
              </CardTitle>
              <CardDescription>
                Update your profile photo to personalize your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage 
                      src={profileData.photo || user?.photo} 
                      alt={user?.fullname} 
                    />
                    <AvatarFallback className="text-3xl bg-blue-100 text-blue-600">
                      {getInitials(user?.fullname || "Supervisor")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-white border-2 border-blue-200 hover:bg-blue-50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updatingPhoto}
                  >
                    {updatingPhoto ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4 text-blue-600" />
                    )}
                  </Button>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Click the camera icon to upload a new photo
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF (Max size: 5MB)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handlePhotoUpdate(file);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupervisorProfileSettings;
