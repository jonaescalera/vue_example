class Category {
    normalize = (categoryData) => {
      const data = categoryData.assetInfo.metadata.props    
      return {
        value: data.name,
        id: categoryData.id
      };
    }
  }
  
  export default Category;