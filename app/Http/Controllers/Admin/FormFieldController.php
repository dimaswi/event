<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FormField;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormFieldController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $perPage = $request->get('perPage', 10);

        $query = FormField::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('label', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $formFields = $query->ordered()->paginate($perPage);

        return Inertia::render('Admin/FormFields/Index', [
            'formFields' => $formFields,
            'filters' => [
                'search' => $search,
                'perPage' => (int) $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/FormFields/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:form_fields',
            'label' => 'required|string|max:255',
            'type' => 'required|in:text,email,tel,textarea,select,radio,checkbox,date,file',
            'options' => 'nullable|array',
            'placeholder' => 'nullable|string',
            'help_text' => 'nullable|string',
            'is_required' => 'boolean',
            'order' => 'integer|min:0',
            'validation_rules' => 'nullable|array',
        ]);

        $formField = FormField::create($request->all());

        return redirect()->route('admin.form-fields.index')
            ->with('message', 'Form field berhasil dibuat.');
    }

    public function show(FormField $formField)
    {
        return Inertia::render('Admin/FormFields/Show', [
            'formField' => $formField
        ]);
    }

    public function edit(FormField $formField)
    {
        return Inertia::render('Admin/FormFields/Edit', [
            'formField' => $formField
        ]);
    }

    public function update(Request $request, FormField $formField)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:form_fields,name,' . $formField->id,
            'label' => 'required|string|max:255',
            'type' => 'required|in:text,email,tel,textarea,select,radio,checkbox,date,file',
            'options' => 'nullable|array',
            'placeholder' => 'nullable|string',
            'help_text' => 'nullable|string',
            'is_required' => 'boolean',
            'order' => 'integer|min:0',
            'validation_rules' => 'nullable|array',
        ]);

        $formField->update($request->all());

        return redirect()->route('admin.form-fields.index')
            ->with('message', 'Form field berhasil diperbarui.');
    }

    public function destroy(FormField $formField)
    {
        $formField->delete();

        return redirect()->route('admin.form-fields.index')
            ->with('message', 'Form field berhasil dihapus.');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'field_id' => 'required|exists:form_fields,id',
            'direction' => 'required|in:up,down',
        ]);

        $field = FormField::findOrFail($request->field_id);
        $currentOrder = $field->order;

        if ($request->direction === 'up') {
            // Find field with higher order (lower position)
            $swapField = FormField::where('order', '<', $currentOrder)
                ->orderBy('order', 'desc')
                ->first();
        } else {
            // Find field with lower order (higher position)
            $swapField = FormField::where('order', '>', $currentOrder)
                ->orderBy('order', 'asc')
                ->first();
        }

        if ($swapField) {
            // Swap orders
            $tempOrder = $field->order;
            $field->order = $swapField->order;
            $swapField->order = $tempOrder;

            $field->save();
            $swapField->save();
        }

        return redirect()->back()->with('message', 'Urutan form field berhasil diperbarui.');
    }

    public function updateOrder(Request $request)
    {
        $request->validate([
            'fields' => 'required|array',
            'fields.*.id' => 'required|exists:form_fields,id',
            'fields.*.order' => 'required|integer|min:0',
        ]);

        foreach ($request->fields as $field) {
            FormField::where('id', $field['id'])->update(['order' => $field['order']]);
        }

        return response()->json(['message' => 'Urutan form field berhasil diperbarui.']);
    }
}
