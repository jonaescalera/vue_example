import { ROLES } from '../constants/roles' 

class User {
    normalize = (data) => {
      const userData = data;      
      const userPermissions = {};
      userData.AddTags ? userData.AddTags === 'true' ? userPermissions.AddTags = true: userPermissions.AddTags = false : userPermissions.AddTags = null;
      userData.EditDeleteGroupsCategories ? userData.EditDeleteGroupsCategories === 'true' ? userPermissions.EditDeleteGroupsCategories = true : userPermissions.EditDeleteGroupsCategories = false : userPermissions.EditDeleteGroupsCategories = null;
      userData.EditDeleteTags ? userData.EditDeleteTags === 'true' ? userPermissions.EditDeleteTags = true : userPermissions.EditDeleteTags = false : userPermissions.EditDeleteTags = null;
      userData.Status ? userData.Status === 'true' ? userPermissions.Status = true : userPermissions.Status = false : userPermissions.Status = null;
      return {
        firstName: userData.fullName,
        lastName: userData.lastName,
        role: userData.Admin === 'true' ? ROLES.ADMIN: userData.role ? userData.role : ROLES.USER,
        userPermissions: userPermissions,
        siteId: userData.siteId,
        email: userData.email,
        phone: userData.phone,
        id: userData.configurationId
      }
    }
    normalizeForCsv = (data) => {
      return {
        firstName: data.fullName,
        lastName: data.lastName,
        role: data.role,
        canEditDeleteTags: data.userPermissions?.EditDeleteTags? 'YES' : 'NO',
        canEditDeleteGroupsCategories: data.userPermissions?.EditDeleteGroupsCategories? 'YES' : 'NO',
        canAddTags: data.userPermissions?.AddTags? 'YES' : 'NO',
        status: data.userPermissions?.Status? 'YES' : 'NO',
        siteId: data.siteId,
        email: data.email,
        phone: data.phone,
        id: data.id
      }
    }
  }
  
  export default User;