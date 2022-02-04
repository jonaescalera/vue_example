

class OrganizationContact {
  normalize=(data)=>{
    return {
      name: data.fullName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      department: data.department,
      title: data.title,
      phone: data.phone,
      role:data.role,
    }
  }
}

export default OrganizationContact;