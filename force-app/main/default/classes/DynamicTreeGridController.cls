public with sharing class DynamicTreeGridController {
    @AuraEnabled(cacheable=true)
    public static List<Case> getAllParentCases() {
        return [SELECT Id, CaseNumber, Subject, Origin, ParentId FROM Case WHERE ParentId = NULL LIMIT 20];
    }

    @AuraEnabled
    public static List<Case> getChildCases(String parentId) {
        return [
            SELECT Id, CaseNumber, Subject, Origin
            FROM Case
            WHERE ParentId = :parentId
        ];
    }
}
