class Group {
    normalize = (groupData) => {
      const data = groupData.assetInfo.metadata.props    
      return {
        value: data.name,
        id: groupData.id
      };
    }
  }
  
  export default Group;