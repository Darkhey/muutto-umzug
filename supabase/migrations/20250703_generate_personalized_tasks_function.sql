CREATE OR REPLACE FUNCTION public.generate_personalized_tasks(
    p_user_id uuid,
    p_move_from_state text,
    p_move_to_state text,
    p_move_to_municipality text,
    p_has_children boolean,
    p_has_pets boolean,
    p_owns_car boolean,
    p_is_self_employed boolean
)
RETURNS SETOF public.tasks
LANGUAGE plpgsql
AS $$
DECLARE
    v_household_id uuid;
    v_profile public.profiles;
    v_template public.checklist_templates;
    v_task_row public.tasks;
BEGIN
    -- Get the household ID for the user
    SELECT id INTO v_household_id FROM public.households WHERE created_by = p_user_id LIMIT 1;

    IF v_household_id IS NULL THEN
        RAISE EXCEPTION 'Household not found for user_id %' , p_user_id;
    END IF;

    -- Get the user profile data
    SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;

    -- Loop through checklist templates and generate tasks based on conditions
    FOR v_template IN
        SELECT *
        FROM public.checklist_templates
    LOOP
        -- Check conditions (simplified for now, will be expanded)
        -- This is a placeholder for more complex JSONB matching logic
        IF v_template.conditions IS NULL OR (
            (v_template.conditions->>'has_children')::boolean IS NULL OR (v_template.conditions->>'has_children')::boolean = p_has_children
        ) AND (
            (v_template.conditions->>'has_pets')::boolean IS NULL OR (v_template.conditions->>'has_pets')::boolean = p_has_pets
        ) AND (
            (v_template.conditions->>'owns_car')::boolean IS NULL OR (v_template.conditions->>'owns_car')::boolean = p_owns_car
        ) AND (
            (v_template.conditions->>'is_self_employed')::boolean IS NULL OR (v_template.conditions->>'is_self_employed')::boolean = p_is_self_employed
        ) THEN
            -- Insert task into the tasks table
            INSERT INTO public.tasks (
                household_id,
                title,
                description,
                phase,
                priority,
                category,
                due_date,
                template_id,
                required_documents,
                online_form_link,
                zuständige_stelle,
                opening_hours,
                source_reference
            )
            VALUES (
                v_household_id,
                v_template.title,
                v_template.description,
                v_template.phase,
                v_template.priority,
                v_template.category,
                -- Calculate due_date based on days_before_move and household move_date
                CASE
                    WHEN v_template.days_before_move IS NOT NULL THEN (SELECT move_date FROM public.households WHERE id = v_household_id) - INTERVAL '1 day' * v_template.days_before_move
                    ELSE NULL
                END,
                v_template.id,
                v_template.required_documents,
                v_template.online_form_link,
                v_template.zuständige_stelle,
                v_template.opening_hours,
                v_template.source_reference
            )
            RETURNING * INTO v_task_row;

            RETURN NEXT v_task_row;
        END IF;
    END LOOP;

    RETURN;
END;
$$;