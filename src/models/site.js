import i18n from '../i18n';

class Site {
  normalize = (siteData) => {
    const data = siteData.assetInfo.metadata.props
    data.labels = {};
    data.labels.tag = data.tag_label || i18n.t("assets-column-name");
    data.labels.category = data.category_label || i18n.t("category");
    data.labels.group = data.group_label || i18n.t("group");
    data.labels.field1 = data.field1_label || i18n.t("assets-column-field1");
    data.labels.field2 = data.field2_label || i18n.t("assets-column-field2");

    siteData.isAf3 = data.isAf3 === 'true';
    siteData.isEverywhere = data.isEverywhere === 'true';
    siteData.isAf2 = (!data.isAf3 && !data.everywhere);
    siteData.organizationId = data.organizationId;
    siteData.isCustomReportsEnable = data.isCustomReportsEnable === 'true';
    siteData.isReportsEnable = data.isReportsEnable === 'true';
    siteData.isWorkflowEnable = data.isWorkflowEnable === 'true';
    return {
      siteData
    };
  }
}

export default Site;