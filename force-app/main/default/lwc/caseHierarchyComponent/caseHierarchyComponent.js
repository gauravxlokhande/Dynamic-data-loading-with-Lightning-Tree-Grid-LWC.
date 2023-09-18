import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

// Import Apex
import getAllParentCases from "@salesforce/apex/DynamicTreeGridController.getAllParentCases";
import getChildCases from "@salesforce/apex/DynamicTreeGridController.getChildCases";

// Global Constants
const COLS = [
	{ fieldName: "CaseNumber", label: "Case Number" },
	{ fieldName: "Subject", label: " Subject" },
	{ fieldName: "Origin", label: "Origin" }
];

export default class DynamicTreeGrid extends LightningElement {
	gridColumns = COLS;
	isLoading = true;
	gridData = [];

	@wire(getAllParentCases, {})
	parentCase({ error, data }) {
		if (error) {
			console.error("error loading cases", error);
		} else if (data) {
			this.gridData = data.map((caseRecord) => ({
				_children: [],
				...caseRecord
			}));
			this.isLoading = false;
		}
	}

	handleOnToggle(event) {
		console.log(event.detail.name);
		console.log(event.detail.hasChildrenContent);
		console.log(event.detail.isExpanded);
		const rowName = event.detail.name;
		if (!event.detail.hasChildrenContent && event.detail.isExpanded) {
			this.isLoading = true;
			getChildCases({ parentId: rowName })
				.then((result) => {
					console.log(result);
					if (result && result.length > 0) {
						const newChildren = result.map((child) => ({
							_children: [],
							...child
						}));
						this.gridData = this.getNewDataWithChildren(
							rowName,
							this.gridData,
							newChildren
						);
					} else {
						this.dispatchEvent(
							new ShowToastEvent({
								title: "No children",
								message: "No children for the selected Case",
								variant: "warning"
							})
						);
					}
				})
				.catch((error) => {
					console.error("Error loading child cases", error);
					this.dispatchEvent(
						new ShowToastEvent({
							title: "Error Loading Children Cases",
							message: error + " " + error?.message,
							variant: "error"
						})
					);
				})
				.finally(() => {
					this.isLoading = false;
				});
		}
	}

	getNewDataWithChildren(rowName, data, children) {
		return data.map((row) => {
			let hasChildrenContent = false;
			if (
				Object.prototype.hasOwnProperty.call(row, "_children") &&
				Array.isArray(row._children) &&
				row._children.length > 0
			) {
				hasChildrenContent = true;
			}

			if (row.Id === rowName) {
				row._children = children;
			} else if (hasChildrenContent) {
				this.getNewDataWithChildren(rowName, row._children, children);
			}
			return row;
		});
	}
}