

class Organization {
  normalize = (organization) => {
    const data = organization.assetInfo.metadata.props
    return {
      id: organization.id,
      name: organization.value,
      address: data.address1,
      address2: data.address2,
      city: data.city,
      primaryContact: data.primaryContact,
      primaryEmail: data.primaryEmail,
      primaryPhone: data.primaryPhone,
      techContact: data.techContact,
      techEmail: data.techEmail,
      techPhone: data.techPhone,
      countryId: data.country,
      stateId: data.state,
      zipCode: data.zipcode,
      enabled: data.active === null ? true:data.active,
      isOrgCustomReportsEnable: data.isOrgCustomReportsEnable === 'true'
    }
  }
}

export default Organization;