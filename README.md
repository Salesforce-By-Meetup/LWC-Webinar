# LWC Webinar source code <!-- omit in toc -->

-   [Abstract](#abstract)
-   [Installation](#installation)
-   [Development Best Practices](#development-best-practices)
    -   [Component data management](#component-data-management)
        -   [Storing](#storing)
        -   [Changing](#changing)
        -   [Passing data through component tree](#passing-data-through-component-tree)
    -   [Code splitting, import/export guide](#code-splitting-importexport-guide)
        -   [In the same file](#in-the-same-file)
        -   [In another JS file in the same component](#in-another-js-file-in-the-same-component)
        -   [In another bundle](#in-another-bundle)
        -   [In another component](#in-another-component)
        -   [Export resources in a bundle with component](#export-resources-in-a-bundle-with-component)
    -   [Documenting and typing, JSDoc](#documenting-and-typing-jsdoc)
        -   [Types](#types)
        -   [Type exporting/importing](#type-exportingimporting)
        -   [Standard types](#standard-types)
        -   [Best Practice for types exporting](#best-practice-for-types-exporting)
-   [Tips and Tricks](#tips-and-tricks)
    -   [Multiple templates and render() override](#multiple-templates-and-render-override)
    -   [Multiple Stylesheets](#multiple-stylesheets)
    -   [Slot discovery](#slot-discovery)
    -   [Custom Mixins](#custom-mixins)
    -   [Hacking standard components styles](#hacking-standard-components-styles)

## Abstract

The repository contains source code and documentation for "Lightning Web Components: Use it now". There are 2 main topics: LWC best practices and tips&tricks. The webinar material doesn't try to be a definitive guide for work with LWC but hopefully it will help you to understand how to work with LWC more effective way.

## Installation

Currently there is a simple installation.

-   Create a scratch org
-   Push the changes via `sfdx force:source:push`
-   Open any salesforce app. The home page will display main components.
-   If the page doesn't show you something different to a standard home page
    -   Open org in Lightning, then open the link `/lightning/setup/FlexiPageList/home`.
    -   Edit "Home Page Default", assign it as org default.

## Development Best Practices

There are some approaches came to me with 1 years of LWC components development. They are not obligatory to follow but they help me with everyday and can help you. They can and will be discussable.

### Component data management

#### Storing

In my life I saw some code in Angular and some code in React. And adding LWC to this list I found that in all the frameworks (I saw, but without a shadow of doubt, Vue supports the same opinion) there is a paradigm for using data:

**The data of the component should be stored in the component's class and passed as properties to the child components.**

You might ask "Where else can I store data?". Remember JQuery? The most basic use-case for it was capture input change and display it elsewhere.

```javascript
$(".my-input").change(function () {
    $(".my-label").text($(this).val());
});
```

Warning: I'm not a JQuery profi so the code might be better but I want to show you that you rely on the state of the different volatile tags' data.

1. Single source of truth.
   The total pain starts when you want to find the difference between the previous and the new values. Here you need to get the label text, but what if someone else changes it, even via debug console. And don't say "This is not JQuery, I can't even do this". Yes, you can. You can use `this.template.querySelector` and not store the data at all. But when you store all the data for your component in the class, you don't relay on any other source like child components or input values in the markup.
2. You don't depend on the re-render cycle.
   Now when you pass the data from the class fields (optionally processed using getters) you don't need to track if your components retrieved with `this.template.querySelector` exist. LWC decides what to set during render flow. It simplifies the process of initializing the component.

Moreover, it makes your code simpler. Instead of manual putting the changes in any dependent component the changed values are put automatically with component re-render.

#### Example <!-- omit in toc -->

The home page shows [data-storing-demo-container](force-app/main/default/lwc/dataStoringDemoContainer/dataStoringDemoContainer.js). It shows 3 components, focus on the first two of them for now.

Please see the [data-storing-wrong-way](./force-app/main/default/lwc/dataStoringWrongWay/dataStoringWrongWay.js) and [data-storing-right-way](./force-app/main/default/lwc/dataStoringRightWay/dataStoringRightWay.js).

They implement the same functionality:

-   There is a phone input with template `(3digits) 3digits-2digits-2digits [restDigits]`
-   The value is set from outside
-   When focus, the editor sees only the numbers
-   When the value is edited and focus is left, the template should be applied back.

The component "dataStoringWrongWay" passes got value straight to the input, what causes the issue of not existing `lightning-input` component on initializing. Also, the code looks cleaner in "rightWay", isn't it?

#### Changing

With modern ES6 features JS becomes more able to use functional approach for the code we write. But together with functional approach you find that often functional approach articles talk about "immutable data". Of course your data does change, but the "immutable data" means that you must avoid the flows of changing the part of the data you have. It makes the code clear and LWC doesn't need to track the deep object changes.
And during my development I found this strategy quite useful.

**Every data change should**

-   **Get required data**
-   **Process it**
-   **Assign the result to the class field**

Previously re-assigning the field values was obligatory if you want to call re-render flow. After Salesforce version 48.0 (Spring'20) the deep changes can be tracked automatically. What you need to do is to add `@track` decorator to the field. All fields without decorator are tracked for re-assigning the value, as it was before. That's why you can use data-changing methods (like array `push`, `pop`, `splice`, object field assignment). But deep-tracked fields make more load on LWC and its proxies. Also it could be hard to find where your object or array was changed if you introduce a variable and pass it somewhere.

#### Data change example <!-- omit in toc -->

Suppose you have an Array of complex objects:

```javascript
class A {
    events = [
        {
            eventType: "webinar",
            online: true,
            offline: false,
            participants: [{ firstName: "Andrey", lastName: "Ivanov" }]
        }
    ];

    onlineParticipants = [];
}
```

You need to find all online events and collect all the participants for the event.
The simple and maybe the faster way would be to use a `for`

```javascript
fillOnlineParticipants() {
    for(let i = 0; i < this.events.length; i++) {
        if (this.events[i].online) {
            for(let j = 0; j < this.events[i].participants; j++) {
                this.onlineParticipants.push(this.events[i].participants[j]);
            }
        }
    }
}
```

But this is a simple task. What if you need to collect more metrics with more sources? You will need more consequent and nested loops for it. What semi-functional approach can offer?

```javascript
fillOnlineParticipants() {
    this.onlineParticipants = getOnlineParticipants(this.events);
}

getOnlineParticipants(events) {
    return events
        .filter(_ => _.online)
        .flatMap(_ => _.participants);
}
```

Oh, this was really shorter. The pros is code is simpler and it could be used somewhere else because it doesn't rely on `this`. The cons here is the `events` array is iterated twice. If you are a performance seeker, you can use `reduce` and combine the methods in one.

```javascript
getOnlineParticipants(events) {
    return events.reduce((onlineParticipants, event) => {
        if (event.online) {
            return onlineParticipants.concat(event.participants);
        }
        return onlineParticipants;
    }, []);

    // or even

    return events.reduce((onlineParticipants, event) => event.online
            ? onlineParticipants.concat(event.participants)
            : onlineParticipants,
        []
    );
}
```

Anyway this is only the example. What's more important to notice is not `filter`, `map` and `reduce` functions, but the separate `getOnlineParticipants` function that only accepts tha data and returns the data. In future if the bug happens, you will need to track what data was assigned to malformed fields and explore the functions that create this data. In the imperative way you might need to debug the functions step by step because it uses `this` in many places. You of course can refactor from first way to the other but why don't you write the code the second way right away?

#### Passing data through component tree

As it was mentioned previously, if it's possible, store the data in fields and use it in the template. But `querySelector` is still a useful function. Let's see an example. You need to create an read/edit field with availability to cancel the changes. So you need to pass mode (view/edit) and data here. But do you need to keep the initial and changed data in the component? I don't think so. You are interested only in the result. That's why you can get the values only when you want to get them in the end of the editing the fields.

There you can make it work 2 ways:

1. Fully aligned to value-event approach. When you change mode back to view, the input component throws a change event with old and new value and parent chooses what to store. Pros - event-driven, as Salesforce recommends. Cons - you need to handle what to store at the moment of event captured. It means that you need to store operation "save"/"cancel" during capturing all the events.
2. Semi aligned to value-event approach. You pass the value straight via template. The process of the result:
   a. "Edit" called - call component to store the initial value internally and `mode = "edit"`
   b. "Save" called - simply get the new value and `mode = "view"`
   c. "Cancel" called - call component to restore the previous value and `mode = "view"`
   This approach is implemented in [data-passing-example](./force-app/main/default/lwc/dataPassingExample/dataPassingExample.js) Pros - you don't make the event handling logic. Cons - you make the logic in the parent component to save/rollback the value. In both ways you can affect the value of the child input if you change it in the parent (Click the "Refresh Components" in "c-data-storing-demo-container" when the "c-data-passing-example" is in edit mode, you will see the input value is changed).

### Code splitting, import/export guide

Most of the JS code in LWC we write stays inside the class. This way class works as Aura controller and helper at once.

#### Code splitting example <!-- omit in toc -->

The example is [import-example-container](./force-app/main/default/lwc/importExampleContainer/importExampleContainer.js) component which also utilizes [import-example-utils](force-app/main/default/lwc/importExampleUtils/importExampleUtils.js) as external code provider.

#### In the same file

But some of the code can be stored outside the class. That's it, unlike the Aura components where you had only 2 objects here you can define fully separate function right in the same js file. The negative sign is these functions can be used only in the same file.

```javascript
import { LightningElement } from "lwc";

/**
 * Returns current timestamp as a string
 * @returns {string}
 */
const getDateTime = () => {
    return "" + new Date().getTime();
};

export default class ImportExampleContainer extends LightningElement {
    someMethod() {
        window.console.log(getDateTime());
    }
}
```

So, shortly the properties:

| purpose                                      | availability scope              | available in Aura | example                                                                                                        |
| -------------------------------------------- | ------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| component-specific logic in small components | only in the file where declared | N/A               | [handleSameFileUpdateClick](./force-app/main/default/lwc/importExampleContainer/importExampleContainer.js#L23) |

#### In another JS file in the same component

This way it is similar to Aura helpers, but here you can define as much separate JS files as you want. Their code can be available only inside the bundle.

This approach is very useful for component-specific data transforming functions if there is a lot of code. For instance, you can move util methods from the main JS file of [import-example-container](./force-app/main/default/lwc/importExampleContainer/importExampleContainer.js) to [importExampleContainerUtils.js](./force-app/main/default/lwc/importExampleContainer/importExampleContainerUtils.js). To allow to import functions separately you need to mark functions with `export` statement. So now you can use it in main file after importing it from the file by relative path.

```javascript
// importExampleContainerUtils.js

export const helpingFunction = (params) => {
    // . . .
};
```

```javascript
// importExampleContainer.js

import { helpingFunction } from "./importExampleContainerUtils";
// or, to rename the function in the destination file
import { helpingFunction as anotherNamedHelpingFunction } from "./importExampleContainerUtils";

// use here
```

If you want to export a single resource, like component-specific labels, you can export it as a default export source

```javascript
// importExampleContainerLabels.js
// import labels here
export default { label1, label2, ... };

// importExampleContainer.js

import LABEL from "./importExampleContainerLabels";
// you can use any name instead of LABELS

// use here

```

Talking about multiple additional JS files, make sure there aren't cycle dependencies.

The properties:

| name             | purpose                                                           | availability scope                                                                                                              | available in Aura | Example                                                                                                                  |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `export`         | component-specific resources in components with a lot of logic    | only in the bundle where declared - other JS files that are not imported in the source files, via `import { ... } from "./..."` | N/A               | [handleAnotherFileUpdateClick](./force-app/main/default/lwc/importExampleContainer/importExampleContainer.js#L27)        |
| `export default` | component-specific resource if it is single to export in the file | only in the bundle where declared - other JS files that are not imported in the source files, via `import ... from "./..."`     | N/A               | [handleAnotherFileDefaultUpdateClick](./force-app/main/default/lwc/importExampleContainer/importExampleContainer.js#L31) |

#### In another bundle

In fact, when you create a LWC component, LWC decides whether it's a component with the markup or just a bundle. To be a component that can be used in other components in markup, you need:

-   your main (named the same way as the whole bundle) JS file should contain `export default` with type of class (in JS class is function tho, but let's skip this talk).
-   this class should extend `LightningElement` class imported from `"lwc"` module.
-   js-meta.xml file is required any way.

And that's it. You can even remove HTML template at all if it is empty. See [import-example-utils](./force-app/main/default/lwc/importExampleUtils/importExampleUtils.js).
Another interesting fact is Local Dev Server understands that your bundle is a component by watching main JS file. If it imports `LightningElement` - this is an element. Does it work or not is another question.

If you want to store the logic and use it in multiple components, you would rather create a bundle and export the resources from here. It's mostly like the previous approach, but there are some differences:

-   You can import only the resources exported in the main JS file of the component
-   You need to use the inter-component path. It's constructed from namespace and component name like "myNamespace/myComponent". In [import-example-container](./force-app/main/default/lwc/importExampleContainer/importExampleContainer.js) you can see that it imports [import-example-utils](force-app/main/default/lwc/importExampleUtils/importExampleUtils.js) via `"c/importExampleUtils"`

The same way as with files in the same component, you can also use `export default` to export only one resource. As an example, you can define a bundle that imports the labels used by many components (buttons labels, toasts, etc)

```javascript
// component uiLabels, uiLabels.js
export default {
    buttonEdit,
    buttonSave,
    buttonCancel
};
```

```javascript
// component that use ui labels, myComponent.js
import UI_LABEL from "c/uiLabels";

export default class MyComponent {
    label = UI_LABEL;
}
```

```html
<!-- myComponent.html -->
<lightning-button label="{label.buttonEdit}"></lightning-button>
```

Properties
| name | purpose | availability scope | available in Aura |Example|
| ---------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |---|
| `export` | resources used in multiple components | in other bundles via `import { ... } from "c/sharedResources"` | No |[handleBundleUpdateClick](./force-app/main/default/lwc/importExampleContainer/importExampleContainer.js#L35)|
| `export default` | single resource used by many components | in other bundles via `import ... from "c/sharedResource"` | No |[handleBundleDefaultUpdateClick](./force-app/main/default/lwc/importExampleContainer/importExampleContainer.js#L39)|

#### In another component

This is a special use-case for the export logic that is needed to be used in the Aura components as well. This way create a component (needs to have an `export default class extends LightningElement`) and link the resources you want to share with `@api` decorated variables.

```javascript
// availableAnywhere, availableAnywhere.js
import { LightningElement, api } from "lwc";

const publicMethod = (properties) => {
    // ...
};

export default class AvailableAnywhere {
    @api publicMethod(properties) {
        return publicMethod(properties);
    }
}
```

```html
<!-- in LWC component template -->
<c-available-anywhere></c-available-anywhere>
```

```javascript
// in LWC controller
callPublicMethod(properties) {
    this.template.querySelector("c-available-anywhere")
        .publicMethod(properties);
}
```

```html
<!-- in Aura component template -->
<c:AvailableAnywhere aura:id="available-anywhere" />
```

```javascript
// in Aura helper
callPublicMethod(component, properties) {
    component.find("available-anywhere").publicMethod(properties);
}
```

Properties
| purpose | availability scope | available in Aura |Example|
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |---|
| resources available in LWC and Aura | in the components via adding the resource component ro the markup and call public methods on it. | **Yes** |[handleComponentUpdateClick](./force-app/main/default/lwc/importExampleContainer/importExampleContainer.js#L35)|

#### Export resources in a bundle with component

Another use-case for exports in a Lightning Component if you want to have this bundle as a component but store some additional resources to help with utilizing the component.

Let's see an example. You work on the custom table component which has a complex column settings and you want to share some simple functions to bootstrap the simple column settings creation.

There are 2 ways

1. export the functions together with default exported class. This way you will be able to both insert the component in the template and import the resources in controller.

    ```javascript
    // superTable, superTable.js

    export const createNumberColumnSetting = (fieldName) => {
        /* ... */
    };
    export const createStringColumnSetting = (fieldName) => {
        /* ... */
    };
    export const createDateColumnSetting = (fieldName) => {
        /* ... */
    };

    export default class SuperTable extends LightningElement {
        /* ... */
    }
    ```

    ```html
    <!-- tableUsage, tableUsage.html -->
    <c-super-table columns={columns}," data={data}></c-super-table>
    ```

    ```javascript
    // tableUsage, tableUsage.js
    import { createNumberColumnSetting, createStringColumnSetting } from "c/superTable";

    export default class TableUsage extends LightningElement {
        columns = [createNumberColumnSetting("id_num"), createStringColumnSetting("name")];
    }
    ```

2. assign the shared resources to the static class fields. This way you will import component's class from default export and then get the resource you need as a static field/method.

    ```javascript
    // superTable, superTable.js
    export default class SuperTable extends LightningElement {
        static createNumberColumnSetting = (fieldName) => {
            /* ... */
        };
        static createStringColumnSetting = (fieldName) => {
            /* ... */
        };
        static createDateColumnSetting = (fieldName) => {
            /* ... */
        };
    }
    ```

    ```html
    <!-- tableUsage, tableUsage.html -->
    <c-super-table columns={columns}," data={data}></c-super-table>
    ```

    ```javascript
    // tableUsage, tableUsage.js
    import SuperTable from "c/superTable";

    export default class TableUsage extends LightningElement {
        columns = [SuperTable.createNumberColumnSetting("id_num"), SuperTable.createStringColumnSetting("name")];
    }
    ```

### Documenting and typing, JSDoc

#### Types

This was a topic I faced with and got into it only some months ago. But this thing sometimes is very helpful.

Sometimes you might face that there is a frequent mistake in simply accessing the field by the wrong name. For instance Apex returns `Id`, LWC expects `recordId`. How can you handle it for the complex objects? The super solution doesn't exist because javascript will always be a weak-type language and Salesforce is not going to allow us a _simple_ way to add Typescript (MS is a competitor to SF, so SF have a reason for it).

Fortunately, what Salesforce offers us to use is VS Code. And this thing has an awesome implicit support for JSDoc which uses the same notation.

A simple use-case. You want to implement the picklist which uses "label"-"value" pair. But in some part of the code you forget if there should be "key", "name" or "value" field. The dought past away if you add the type to the argument you are working with.

```javascript
/**
 * Processes options
 * @param {{label: string, value: string}[]} options options to process
 */
function processOptions(options) {}
```

Short clarifications:

-   any type should be in `{}`, first comes field name, then it's type after a colon
-   JS supports it's primitives: number, string, boolean
-   objects are declared as brackets with fields in it separated by a comma
-   arrays are declared as `Array<TYPE>` or `TYPE[]`, doesn't matter
-   if you want to create a type for Map-like structure which looks like an object, you can use `Object.<KEY_TYPE, VALUE_TYPE>` or `{[KEY_NAME: KEY_TYPE]: VALUE_TYPE}`
-   If you want to specify a standard payload for custom event, set it as `CustomEvent<PAYLOAD_TYPE>`, `event.detail` automatically will capture the type passed here.
-   functions can be declared as `(param1:PARAM_1_TYPE, ...) => RETURN_TYPE` or via [@callback](https://jsdoc.app/tags-callback.html) declaration separately

But repeating this notation with label and value is cumbersome. So that JSDOC has a [@typedef](https://jsdoc.app/tags-typedef.html) declaration

```javascript
/**
 * @typedef {{label: string, value: string}} PicklistOption
 */

/**
 * Processes options
 * @param {PicklistOption[]} options options to process
 */
function processOptions(options) {}
```

After this declaration you can only mention `PicklistOption` instead of the whole type.

#### Type exporting/importing

What surprises me even now is types are implicitly exported from the file where you declare them. So that they can be used in other files/components.

The only limitation is you can not re-export the type. It means that you cannot define a type in a helper JS file, import it to the main one and then export it to import in another component.

Suppose we need a picklist but `change` event needs to send `{value, label}` pair. This way let's create a simple picklist component that sends custom "mychange" event with the whole option and track it in the main component. See the `CustomPicklistChangeEvent` type in [custom-picklist](./force-app/main/default/lwc/customPicklist/customPicklist.js) and its usage in [custom-picklist-usage](./force-app/main/default/lwc/customPicklistUsage/customPicklistUsage.js).

```javascript
// myComponent.js
/**
 * @typedef {...} MyType
 */
// ...
```

```javascript
// myComponentUsage.js
import { MyType } from "c/myComponent";
```

A sad fact is SFDX plugin not always helps you with this. All the magic with `"c/..."` imports is supported locally via [`lwc/jsconfig.json`](./force-app/main/default/lwc/jsconfig.json) file. To enable it, you need to have the next options. But during this project LWC did nothing to `"compilerOptions"` property, it had only `"experimentalDecorators"` and that's it. From the other hand, in another project it made all the paths automatically. That's why I added jsconfig to the repository despite it's ignored by default SFDX gitignore.

```json
{
    "compilerOptions": {
        "baseUrl": ".",
        "experimentalDecorators": true,
        "target": "es6",
        "paths": {
            "c/componentName": ["componentName/componentName.js"]
        }
    }
}
```

#### Standard types

Yes, they exist! And they are helpful in their field. They are stored in `.sfdx/tools/typings/lwc` folder. The ones I liked are the types for UI API. There are plenty of properties on the fields and SObjects and to see them you either need to open the UI API documentation or perform a test launch and copy the whole object and store it internally. Honestly, I did it the second way. And once I was fed up opening it once again and created my own shorted type definitions. But during preparing the webinar material I found that they are already declared, for some reason - in `"lightning/uiRecordApi"` module. But they work good! See the usage in the [account-sobject-definition-fetcher](force-app/main/default/lwc/accountSobjectDefinitionFetcher/accountSobjectDefinitionFetcher.js)

Unfortunately, you can't extend them because local `.d.ts` files are only for your comfort. On Salesforce side all the imports are replaced with the links to their internal JS files.

#### Best Practice for types exporting

-   If the type is local only, you can declare it in a main JS file or in a separate helper if the type needs to be used in many internal JS files
-   If the type is for multiple components that interact with your component (like `PicklistOption` in the example), define it in the component
-   If the type is for multiple components and there's no root component for it (in big code base there could be many components that use `PicklistOption` without referring to your `custom-picklist`), then create a separate component (like `commonTypes`) and declare the type there
-   Your component classes don't need to have types by `@typedef`, you can export it and use as type in JSDoc comments

## Tips and Tricks

These topics are about the use-cases of LWC that are not well-known. Some of them you will never face, lucky you are. But forewarned is forearmed, so let's forearm you!

### Multiple templates and render() override

Since you started learning your first programming language, you must have heared the principle of dividing the functions (it even grew to first SOLID principle): each function should stand for one action. The same principle <strike>might</strike> must be applied to components: each component should implement one feature. And components `lightning-formatted-something` align with this principle well. But `lightning-input` doesn't: Salesforce needs a lot of internal components and code to display stylized date, time and color pickers. So despite it represents input in LWC environment, it's not fully one-purpose component. Imagine you need to do something similar. Your template will look like this.

```HTML
<template>
    <template if:true={firstVariant}>
        <!-- much markup inside -->
    </template>
    <template if:true={secondVariant}>
        <!-- even more markup inside -->
    </template>
    <!-- even more variants -->
</template>
```

Not the best look, is it?
But Salesforce allows you to split the markup by a list of the templates and choose one of them during render flow.

```HTML
<template>
    <!-- first variant: much markup inside -->
</template>
```

```HTML
<template>
    <!-- second variant: much markup inside -->
    <!-- but in another file -->
</template>
```

To do that create a `render()` function. This function should return the markup. If it returns `undefined`, no markup is rendered.

How to return the markup? Import it as `"./myComponent.html"` file.

Let's view an example for Phone Input ([data-passing-example](./force-app/main/default/lwc/dataPassingExample/dataPassingExample.html)) and split the view and Edit mode into two templates. Now open [multi-template-example](force-app/main/default/lwc/multiTemplateExample/multiTemplateExample.js).

```javascript
import templateEdit from "./multiTemplateExampleEdit.html";
import templateView from "./multiTemplateExampleView.html";

render() {
    if (this.mode === "view") {
        return templateView;
    } else if (this.mode === "edit") {
        return templateEdit;
    }
    return undefined;
}
```

What about CSS files? The rule is simple: your CSS file should have the same name as the template.

Can I transfer the template as a property from one component to another? Yes as well. Example: [multi-template-example-dynamic](force-app/main/default/lwc/multiTemplateExampleDynamic/multiTemplateExampleDynamic.js). The real example of such necromancy is a Lightning Datatable with custom cell column types. You can define a class that extends LightningDatatable and add a static field with properties and references to your templates. Once created, your enhanced datatable will capture new columns and apply them where required.

### Multiple Stylesheets

Yes, it is possible as well. Since Summer'20 (v49.0) you can import stylesheets one into another.
The example of internal imports in component is in [multi-template-example](force-app/main/default/lwc/multiTemplateExample/multiTemplateExampleEdit.css). There is a common stylesheet "multiTemplateExampleCommon.css" which is imported by the others via

```CSS
@import "./multiTemplateExampleCommon.css";
```

Don't forget the semicolon at the end!

The inter-component style is a little more difficult. Your component must have ONLY `css` and `js-meta.xml` files. The import process is the same to importing the default exported resource

```CSS
@import "c/appBuilderStyled";
```

The examples of usage are all the displayed on the page components: [data-storing-demo-container](force-app/main/default/lwc/dataStoringDemoContainer/dataStoringDemoContainer.css), [custom-picklist-usage](./force-app/main/default/lwc/customPicklistUsage/customPicklistUsage.css) and the others. They all import [app-builder-styled](force-app/main/default/lwc/appBuilderStyled/appBuilderStyled.css) stylesheet. I just wanted them all to have a white background and a little padding for beauty. So this was a simple example of where to use it.

During the development I found an interesting issue with it: when you push the component which style imports stylesheet-component, the push fails if the stylesheet-component is not included. That's why during the examples development I had to change something in appBuilderStyled CSS to push that component and then change it back.

### Slot discovery

Have you ever wondered how standard accordion or tabset find their childs? Probably you thought about something like dynamic slot name, but unfortunately Salesforce doesn't support it. The real approach is not very interesting but it hides in knowledge about events. Event can be handled even on the component itself, this way it will listen to the whole markup inside.

```javascript
// superTabset.js
connectedCallback() {
    this.addEventListener("registersupertab", (event) => {
        this.tabs = [...this.tabs, {
            name: event.detail,
            component: event.target
        }];
    })
}
```

Now your superTabs need to publish the registering event

```javascript
// superTab.js
connectedCallback() {
    this.dispatchEvent(new CustomEvent("registersupertab", detail: this.name));
}
@api show() { /* ... */}
@api hide() { /* ... */}
```

All the rest is to define the API to show or hide the tab.
But when you want to define your tab behavior during show/hide actions there comes an unavailability to do it. There are 2 possible ways. First is store all this logic in the main component (the one that inserts tabset in your one).

The other is custom mixins

### Custom Mixins

Talking about importing/exporting we exported and imported the functions to use them in the component logics. But those functions had one negative sign - they could not use `this` object. And talking about unavailability for your own code, it makes the exported functions re-usable. But what if you want to have access to `LightningElement` fields?

The easiest way is to pass `this` as an argument to the functions.
Another more elegant way is mixins.
Mixin is a function that returns a class that extends a given one. You pass `LightningElement` as given and extend it in your own component class. The result inheritance tree will be:

```text
LightningElement
      ^
      |
Mixed-in class
      ^
      |
MyComponent
```

Personally I was tired writing `this.template.querySelector` and `this.dispatchEvent(new CustomEvent())`. I wanted some shorter function name, like `this.$` and `this.fire`. I could create these functions in every component or I could create a mixin or even mixed class.

```javascript
// lightningCommons/lightningCommons.js
import { LightningElement as BaseLightningElement } from "lwc";

export const LightningBaseMixin = (baseClass) => {
    return class extends baseClass {
        $(selector) {
            return this.template.querySelector(selector);
        }
        $$(selector) {
            return this.template.querySelectorAll(selector);
        }
        fire(name, detail, bubbles = false, composed = false) {
            this.dispatchEvent(new CustomEvent(name, { detail, bubbles, composed }));
        }
    };
};
export const LightningElement = LightningBaseMixin(LightningElementBase);
```

The limitation is you can't create component named `lwc` and use `api`, `track`, `wire` from any other module except `lwc`, so full replacing `"lwc"` by your component is impossible.

For the tabs example, we can define `TabMixin`

```javascript
const TabMixin = (baseClass) =>
    class extends baseClass {
        constructor(...args) {
            setTimeout(() => this.dispatchEvent(new CustomEvent("supertabregister")), 0);
        }
    };
```

Why not `connectedCallback` - because you will need to write `connectedCallback() { super.connectedCallback();}`. We don't want you to write extra boilerplate code.

The drawback is you need to define your own `show` and `hide` methods for not only your logic, but for showing/hiding as well. The cost of flexibility.

Exactly the same way famous `NavigationMixin` works. The weird notation of `this[NavigationMixin.Navigate]()` is only in order not to collide with your own methods.

### Hacking standard components styles

There we should discuss what is the shadow root. The _real_ shadow root encapsulates the parts of the dom, like a bounds for selectors and events. You can open [lwc.dev recepies](https://recipes.lwc.dev/) and see in the debug console that parts of the markup are separated by `#shadow-root` element.

If you work with such components, the only way to style them from the outside is when the component allows you to do it adding `part` attribute to it's markup.

```HTML
<ui-header>
    <!-- #shadow-root -->
        <ul>
            <li part="item">...</li>
        </ul>
</ui-header>
```

```CSS
/* outside code */
ui-header::part(item) {
    /* styles applicable for shadowed component */
}
ui-header::part(item) .title {
    /* styles NOT applicable for shadowed li
    because going deep in the part is forbidden */
}
```

Salesforce LWC simulates shadow dom via adding the unique selectors in th markup to every tag of your template. So that your myComponent in the DOM will look like

```HTML
<div c_my_component_my_component>
    <span c_my_component_my_component>Hi</span>
    <lightning-input c_my_component_my_component lightning_input_input_host>
        <input lightning_input_input />
    </lightning-input>
</div>
```

Meanwhile all your CSS written in the component is transformed to add the same unique attribute to all the parts of the selectors.

```CSS
div[c_my_component_my_component] {
    padding: 1em;
}
div[c_my_component_my_component] > span[c_my_component_my_component] {
    font-weight: bold;
}
div[c_my_component_my_component] input[c_my_component_my_component] {
    color: red; /* not applied, input has only lightning-input attr */
}
```

But static resource styles are not transformed at all. So that loading external css file is a common approach to change some parts of the standard markup. But make sure your style changes only your component, so that add a custom class to identify your components.

component - [address-output](./force-app/main/default/lwc/addressOutput/addressOutput.js)
