import { describe, it, expect } from 'vitest';
import { parseCsvSystems } from '@/lib/import/parse-csv';

describe('parseCsvSystems', () => {
  it('should parse a full CSV with all columns', () => {
    const csv = `name,vendor,type,hosting,status,cost,cost_period,function
Salesforce,Salesforce Inc,CRM,cloud,active,500,monthly,fundraising
Xero,Xero Ltd,Finance,cloud,active,30,monthly,finance`;

    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0].name).toBe('Salesforce');
      expect(result.rows[0].matchedType).toBe('crm');
      expect(result.rows[0].vendor).toBe('Salesforce Inc');
      expect(result.rows[0].cost).toBe(500);
      expect(result.rows[0].costPeriod).toBe('monthly');
      expect(result.rows[0].matchedFunction).toBe('fundraising');
      expect(result.rows[0].completeness).toBe('full');

      expect(result.rows[1].name).toBe('Xero');
      expect(result.rows[1].matchedType).toBe('finance');
    }
  });

  it('should parse CSV with only name column', () => {
    const csv = `name
Salesforce
Xero`;

    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0].name).toBe('Salesforce');
      expect(result.rows[0].completeness).toBe('minimal');
      expect(result.rows[0].matchedType).toBe('other');
    }
  });

  it('should accept "system" as alias for name column', () => {
    const csv = `system,type
Salesforce,CRM`;

    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows[0].name).toBe('Salesforce');
    }
  });

  it('should accept "tool" as alias for name column', () => {
    const csv = `tool,type
Salesforce,CRM`;

    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows[0].name).toBe('Salesforce');
    }
  });

  it('should skip rows with no name', () => {
    const csv = `name,type
Salesforce,CRM
,Finance
Xero,Finance`;

    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows).toHaveLength(2);
      expect(result.warnings).toContain('Skipped 1 row with no name.');
    }
  });

  it('should fuzzy match system types', () => {
    const csv = `name,type
My CRM,Customer Relationship Management
My Site,Web Site
Chat App,Slack / messaging
HR System,Human Resources
Docs,Document Management System
Data,Database system
Sheets,Google Sheets`;

    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows[0].matchedType).toBe('crm');
      expect(result.rows[1].matchedType).toBe('website');
      expect(result.rows[2].matchedType).toBe('messaging');
      expect(result.rows[3].matchedType).toBe('hr');
      expect(result.rows[4].matchedType).toBe('document_management');
      expect(result.rows[5].matchedType).toBe('database');
      expect(result.rows[6].matchedType).toBe('spreadsheet');
    }
  });

  it('should fuzzy match functions', () => {
    const csv = `name,function
Tool A,Finance & Accounting
Tool B,HR / People
Tool C,Marketing & Comms
Tool D,Service Delivery
Tool E,Fundraising & Development
Tool F,IT / Operations
Tool G,Reporting & Data`;

    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows[0].matchedFunction).toBe('finance');
      expect(result.rows[1].matchedFunction).toBe('people');
      expect(result.rows[2].matchedFunction).toBe('communications');
      expect(result.rows[3].matchedFunction).toBe('service_delivery');
      expect(result.rows[4].matchedFunction).toBe('fundraising');
      expect(result.rows[5].matchedFunction).toBe('operations');
      expect(result.rows[6].matchedFunction).toBe('data_reporting');
    }
  });

  it('should return error for empty CSV', () => {
    const result = parseCsvSystems('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it('should return error for CSV with no name column', () => {
    const csv = `type,vendor
CRM,Salesforce`;

    const result = parseCsvSystems(csv);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('name');
    }
  });

  it('should parse costs stripping $ and commas', () => {
    const csv = `name,cost
Tool A,"$1,500"
Tool B,£200.50
Tool C,3000`;

    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows[0].cost).toBe(1500);
      expect(result.rows[1].cost).toBe(200.50);
      expect(result.rows[2].cost).toBe(3000);
    }
  });

  it('should accept annual_cost and price as cost aliases', () => {
    const csv = `name,annual_cost
Tool A,1200`;

    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows[0].cost).toBe(1200);
    }
  });

  it('should accept department as function alias', () => {
    const csv = `name,department
Tool A,Finance`;

    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows[0].matchedFunction).toBe('finance');
    }
  });

  it('should compute completeness correctly', () => {
    const csv = `name,type,vendor,hosting
Full System,CRM,Salesforce,cloud
Partial System,CRM,,
Minimal System,,,`;

    const result = parseCsvSystems(csv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rows[0].completeness).toBe('full');
      expect(result.rows[1].completeness).toBe('partial');
      expect(result.rows[2].completeness).toBe('minimal');
    }
  });
});
